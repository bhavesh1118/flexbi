from fastapi import FastAPI, HTTPException, Request, BackgroundTasks, WebSocket, WebSocketDisconnect, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel, Field, validator
from typing import List, Dict, Any, Optional, Union, AsyncGenerator, BinaryIO
import json
import os
import subprocess
import sys
from datetime import datetime, timedelta
import math
import random
import asyncio
import aiofiles
import numpy as np
import pandas as pd
from concurrent.futures import ThreadPoolExecutor, ProcessPoolExecutor
import threading
import time
import logging
from functools import lru_cache, wraps
import hashlib
import pickle
from collections import defaultdict, deque
import weakref
import tempfile
import shutil
import io
import gc
import psutil
from pathlib import Path
import chardet
import xlsxwriter
import openpyxl
from memory_profiler import profile
import dask.dataframe as dd

app = FastAPI(
    title="FlexBI Analytics API",
    description="Ultra High-Performance Analytics Backend with Real-time Streaming",
    version="3.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/api/v1/openapi.json"
)

# Enhanced file processing configuration
MAX_FILE_SIZE = 200 * 1024 * 1024  # 200MB
CHUNK_SIZE = 64 * 1024 * 1024  # 64MB chunks for processing
TEMP_DIR = Path(tempfile.gettempdir()) / "flexbi_temp"
TEMP_DIR.mkdir(exist_ok=True)

# Memory management settings
MEMORY_THRESHOLD = 0.90  # 90% memory usage threshold (increased from 85%)
MAX_ROWS_PER_CHUNK = 50000  # Reduced chunk size for better memory management

# Performance optimizations
app.add_middleware(GZipMiddleware, minimum_size=500)  # Compress responses aggressively
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Advanced thread pools for different workloads - optimized for large file processing
cpu_executor = ThreadPoolExecutor(max_workers=min(16, os.cpu_count() + 4), thread_name_prefix="CPU-")
io_executor = ThreadPoolExecutor(max_workers=32, thread_name_prefix="IO-")
process_executor = ProcessPoolExecutor(max_workers=min(8, os.cpu_count()))
file_processor = ThreadPoolExecutor(max_workers=4, thread_name_prefix="FileProc-")

# Real-time data streaming
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.data_cache = {}
        self.last_update = {}
    
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
    
    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
    
    async def broadcast(self, message: dict):
        dead_connections = []
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except:
                dead_connections.append(connection)
        
        # Clean up dead connections
        for dead in dead_connections:
            self.disconnect(dead)

manager = ConnectionManager()

# High-performance caching system
class AdvancedCache:
    def __init__(self, max_size=1000, ttl=300):
        self.cache = {}
        self.access_times = deque()
        self.max_size = max_size
        self.ttl = ttl
        self.lock = threading.RLock()
    
    def _generate_key(self, *args, **kwargs):
        key_data = str(args) + str(sorted(kwargs.items()))
        return hashlib.md5(key_data.encode()).hexdigest()
    
    def get(self, key):
        with self.lock:
            if key in self.cache:
                data, timestamp = self.cache[key]
                if time.time() - timestamp < self.ttl:
                    return data
                else:
                    del self.cache[key]
            return None
    
    def set(self, key, value):
        with self.lock:
            current_time = time.time()
            self.cache[key] = (value, current_time)
            self.access_times.append((key, current_time))
            
            # Clean old entries
            if len(self.cache) > self.max_size:
                self._cleanup()
    
    def _cleanup(self):
        current_time = time.time()
        # Remove expired entries
        expired_keys = [
            k for k, (_, t) in self.cache.items() 
            if current_time - t > self.ttl
        ]
        for k in expired_keys:
            del self.cache[k]
        
        # Remove oldest entries if still over limit
        while len(self.cache) > self.max_size * 0.8:
            if self.access_times:
                old_key, _ = self.access_times.popleft()
                if old_key in self.cache:
                    del self.cache[old_key]

cache = AdvancedCache(max_size=2000, ttl=600)

# Performance monitoring
class PerformanceMonitor:
    def __init__(self):
        self.request_times = defaultdict(list)
        self.request_counts = defaultdict(int)
        self.errors = defaultdict(int)
        self.start_time = time.time()
    
    def record_request(self, endpoint: str, duration: float, success: bool = True):
        self.request_times[endpoint].append(duration)
        self.request_counts[endpoint] += 1
        if not success:
            self.errors[endpoint] += 1
        
        # Keep only last 1000 requests per endpoint
        if len(self.request_times[endpoint]) > 1000:
            self.request_times[endpoint] = self.request_times[endpoint][-1000:]
    
    def get_stats(self):
        stats = {}
        for endpoint in self.request_times:
            times = self.request_times[endpoint]
            if times:
                stats[endpoint] = {
                    "avg_response_time": sum(times) / len(times),
                    "min_response_time": min(times),
                    "max_response_time": max(times),
                    "total_requests": self.request_counts[endpoint],
                    "error_count": self.errors[endpoint],
                    "error_rate": self.errors[endpoint] / self.request_counts[endpoint] if self.request_counts[endpoint] > 0 else 0
                }
        return {
            "endpoints": stats,
            "uptime": time.time() - self.start_time,
            "total_requests": sum(self.request_counts.values()),
            "cache_size": len(cache.cache)
        }

monitor = PerformanceMonitor()

# Enhanced Large File Processing System
class LargeFileProcessor:
    def __init__(self):
        self.active_uploads = {}
        self.processing_status = {}
        self.memory_monitor = threading.Thread(target=self._monitor_memory, daemon=True)
        self.memory_monitor.start()
    
    def _monitor_memory(self):
        """Monitor system memory usage"""
        while True:
            try:
                memory_percent = psutil.virtual_memory().percent / 100
                if memory_percent > MEMORY_THRESHOLD:
                    logging.warning(f"High memory usage: {memory_percent:.2%}")
                    # Force garbage collection
                    gc.collect()
                time.sleep(5)
            except Exception as e:
                logging.error(f"Memory monitoring error: {e}")
                time.sleep(10)
    
    async def validate_file(self, file: UploadFile) -> Dict[str, Any]:
        """Validate uploaded file"""
        if file.size > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=413,
                detail=f"File too large. Maximum size allowed: {MAX_FILE_SIZE / (1024*1024):.0f}MB"
            )
        
        # Check file extension
        allowed_extensions = {'.csv', '.xlsx', '.xls', '.json', '.tsv', '.txt'}
        file_extension = Path(file.filename).suffix.lower()
        
        if file_extension not in allowed_extensions:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file type. Allowed: {', '.join(allowed_extensions)}"
            )
        
        return {
            "filename": file.filename,
            "size": file.size,
            "extension": file_extension,
            "content_type": file.content_type
        }
    
    async def process_large_file(self, file: UploadFile, processing_id: str) -> AsyncGenerator[Dict[str, Any], None]:
        """Process large files in chunks with real-time updates"""
        try:
            # Create temporary file
            temp_file_path = TEMP_DIR / f"{processing_id}_{file.filename}"
            
            # Update status
            self.processing_status[processing_id] = {
                "status": "uploading",
                "progress": 0,
                "message": "Uploading file...",
                "start_time": time.time()
            }
            
            # Save uploaded file
            total_size = 0
            async with aiofiles.open(temp_file_path, 'wb') as temp_file:
                while chunk := await file.read(CHUNK_SIZE):
                    await temp_file.write(chunk)
                    total_size += len(chunk)
                    
                    # Update progress
                    progress = min(50, (total_size / file.size) * 50) if file.size > 0 else 50
                    self.processing_status[processing_id]["progress"] = progress
                    
                    yield {
                        "type": "progress",
                        "progress": progress,
                        "message": f"Uploaded {total_size / (1024*1024):.1f}MB"
                    }
            
            # Process the file
            self.processing_status[processing_id].update({
                "status": "processing",
                "progress": 50,
                "message": "Processing file..."
            })
            
            # Detect file encoding for text files
            encoding = await self._detect_encoding(temp_file_path)
            
            # Process based on file type
            file_extension = Path(file.filename).suffix.lower()
            
            if file_extension in ['.csv', '.tsv', '.txt']:
                async for result in self._process_csv_file(temp_file_path, encoding, processing_id):
                    yield result
            elif file_extension in ['.xlsx', '.xls']:
                async for result in self._process_excel_file(temp_file_path, processing_id):
                    yield result
            elif file_extension == '.json':
                async for result in self._process_json_file(temp_file_path, encoding, processing_id):
                    yield result
            
        except Exception as e:
            self.processing_status[processing_id] = {
                "status": "error",
                "progress": 0,
                "message": f"Error: {str(e)}"
            }
            yield {
                "type": "error",
                "message": str(e)
            }
        finally:
            # Cleanup
            if temp_file_path.exists():
                temp_file_path.unlink()
    
    async def _detect_encoding(self, file_path: Path) -> str:
        """Detect file encoding"""
        try:
            with open(file_path, 'rb') as f:
                raw_data = f.read(min(100000, file_path.stat().st_size))  # Read first 100KB
                result = chardet.detect(raw_data)
                return result.get('encoding', 'utf-8') or 'utf-8'
        except Exception:
            return 'utf-8'
    
    async def _process_csv_file(self, file_path: Path, encoding: str, processing_id: str) -> AsyncGenerator[Dict[str, Any], None]:
        """Process CSV files with chunking for large datasets"""
        try:
            # Use Dask for large CSV files
            separator = '\t' if file_path.suffix.lower() == '.tsv' else ','
            
            # Try to read with pandas first for smaller files
            try:
                df = pd.read_csv(file_path, encoding=encoding, sep=separator, nrows=1000)
                total_rows = sum(1 for _ in open(file_path, 'r', encoding=encoding)) - 1  # Subtract header
                
                if total_rows <= 1000000:  # Use pandas for smaller files
                    df = pd.read_csv(file_path, encoding=encoding, sep=separator)
                    async for result in self._process_dataframe(df, processing_id, "pandas"):
                        yield result
                else:  # Use Dask for larger files
                    ddf = dd.read_csv(file_path, encoding=encoding, sep=separator)
                    async for result in self._process_dask_dataframe(ddf, processing_id):
                        yield result
                    
            except Exception as e:
                # Fallback to chunk processing
                async for result in self._process_csv_chunks(file_path, encoding, separator, processing_id):
                    yield result
                
        except Exception as e:
            yield {
                "type": "error",
                "message": f"CSV processing error: {str(e)}"
            }
    
    async def _process_excel_file(self, file_path: Path, processing_id: str) -> AsyncGenerator[Dict[str, Any], None]:
        """Process Excel files efficiently"""
        try:
            # Read Excel file with openpyxl for better large file support
            workbook = openpyxl.load_workbook(file_path, read_only=True)
            sheet_names = workbook.sheetnames
            
            for i, sheet_name in enumerate(sheet_names):
                self.processing_status[processing_id].update({
                    "progress": 50 + (i / len(sheet_names)) * 40,
                    "message": f"Processing sheet: {sheet_name}"
                })
                
                # Read sheet in chunks
                df = pd.read_excel(file_path, sheet_name=sheet_name, engine='openpyxl')
                
                yield {
                    "type": "sheet_processed",
                    "sheet_name": sheet_name,
                    "rows": len(df),
                    "columns": len(df.columns),
                    "data_preview": df.head(5).to_dict('records'),
                    "column_info": self._analyze_columns(df)
                }
            
            workbook.close()
            
        except Exception as e:
            yield {
                "type": "error",
                "message": f"Excel processing error: {str(e)}"
            }
    
    async def _process_json_file(self, file_path: Path, encoding: str, processing_id: str) -> AsyncGenerator[Dict[str, Any], None]:
        """Process JSON files with streaming for large files"""
        try:
            file_size = file_path.stat().st_size
            
            if file_size < 50 * 1024 * 1024:  # < 50MB, load normally
                with open(file_path, 'r', encoding=encoding) as f:
                    data = json.load(f)
                
                if isinstance(data, list):
                    df = pd.DataFrame(data)
                    async for result in self._process_dataframe(df, processing_id, "json"):
                        yield result
                else:
                    yield {
                        "type": "json_object",
                        "data": data,
                        "size": len(str(data))
                    }
            else:
                # Stream large JSON files
                async for result in self._stream_large_json(file_path, encoding, processing_id):
                    yield result
                
        except Exception as e:
            yield {
                "type": "error",
                "message": f"JSON processing error: {str(e)}"
            }
    
    async def _process_dataframe(self, df: pd.DataFrame, processing_id: str, source_type: str) -> AsyncGenerator[Dict[str, Any], None]:
        """Process pandas DataFrame with analysis"""
        try:
            rows, cols = df.shape
            
            # Update progress
            self.processing_status[processing_id].update({
                "progress": 70,
                "message": f"Analyzing {rows:,} rows and {cols} columns"
            })
            
            # Basic analysis
            analysis = {
                "rows": rows,
                "columns": cols,
                "memory_usage": df.memory_usage(deep=True).sum(),
                "column_info": self._analyze_columns(df),
                "data_types": df.dtypes.to_dict(),
                "null_counts": df.isnull().sum().to_dict(),
                "data_preview": df.head(10).to_dict('records')
            }
            
            # Generate summary statistics
            numeric_columns = df.select_dtypes(include=[np.number]).columns
            if len(numeric_columns) > 0:
                analysis["summary_stats"] = df[numeric_columns].describe().to_dict()
            
            self.processing_status[processing_id].update({
                "progress": 90,
                "message": "Generating insights..."
            })
            
            # Generate insights
            insights = self._generate_insights(df)
            
            yield {
                "type": "complete",
                "source_type": source_type,
                "analysis": analysis,
                "insights": insights,
                "processing_time": time.time() - self.processing_status[processing_id]["start_time"]
            }
            
            self.processing_status[processing_id].update({
                "status": "complete",
                "progress": 100,
                "message": "Processing complete"
            })
            
        except Exception as e:
            yield {
                "type": "error",
                "message": f"DataFrame processing error: {str(e)}"
            }
    
    def _analyze_columns(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Analyze DataFrame columns"""
        column_info = {}
        
        for col in df.columns:
            col_data = df[col]
            info = {
                "data_type": str(col_data.dtype),
                "null_count": col_data.isnull().sum(),
                "null_percentage": (col_data.isnull().sum() / len(col_data)) * 100,
                "unique_values": col_data.nunique(),
                "memory_usage": col_data.memory_usage(deep=True)
            }
            
            if col_data.dtype in ['int64', 'float64', 'int32', 'float32']:
                info.update({
                    "min": col_data.min(),
                    "max": col_data.max(),
                    "mean": col_data.mean(),
                    "std": col_data.std()
                })
            elif col_data.dtype == 'object':
                info.update({
                    "avg_length": col_data.str.len().mean() if col_data.dtype == 'object' else None,
                    "max_length": col_data.str.len().max() if col_data.dtype == 'object' else None
                })
            
            column_info[col] = info
        
        return column_info
    
    def _generate_insights(self, df: pd.DataFrame) -> List[Dict[str, Any]]:
        """Generate data insights"""
        insights = []
        
        # Data quality insights
        total_cells = df.shape[0] * df.shape[1]
        null_cells = df.isnull().sum().sum()
        
        if null_cells > 0:
            insights.append({
                "type": "data_quality",
                "severity": "warning" if null_cells / total_cells > 0.1 else "info",
                "message": f"Dataset contains {null_cells:,} null values ({(null_cells/total_cells)*100:.1f}% of all cells)"
            })
        
        # Large dataset insight
        if df.shape[0] > 1000000:
            insights.append({
                "type": "performance",
                "severity": "info",
                "message": f"Large dataset detected with {df.shape[0]:,} rows. Consider using sampling for faster analysis."
            })
        
        # Memory usage insight
        memory_mb = df.memory_usage(deep=True).sum() / (1024 * 1024)
        if memory_mb > 100:
            insights.append({
                "type": "memory",
                "severity": "warning",
                "message": f"Dataset uses {memory_mb:.1f}MB of memory. Consider data type optimization."
            })
        
        # Column insights
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        categorical_cols = df.select_dtypes(include=['object']).columns
        
        if len(categorical_cols) > len(numeric_cols) * 2:
            insights.append({
                "type": "structure",
                "severity": "info",
                "message": f"Dataset is primarily categorical ({len(categorical_cols)} categorical vs {len(numeric_cols)} numeric columns)"
            })
        
        return insights

    async def _process_dask_dataframe(self, ddf, processing_id: str) -> AsyncGenerator[Dict[str, Any], None]:
        """Process Dask DataFrame for very large datasets"""
        try:
            # Compute basic statistics
            rows = len(ddf)
            cols = len(ddf.columns)
            
            self.processing_status[processing_id].update({
                "progress": 70,
                "message": f"Processing large dataset with {rows:,} rows"
            })
            
            # Sample data for preview
            sample_df = ddf.head(1000).compute()
            
            analysis = {
                "rows": rows,
                "columns": cols,
                "is_large_dataset": True,
                "column_info": self._analyze_columns(sample_df),
                "data_types": dict(ddf.dtypes),
                "data_preview": sample_df.head(10).to_dict('records')
            }
            
            yield {
                "type": "complete",
                "source_type": "dask",
                "analysis": analysis,
                "insights": self._generate_insights(sample_df),
                "processing_time": time.time() - self.processing_status[processing_id]["start_time"]
            }
            
        except Exception as e:
            yield {
                "type": "error", 
                "message": f"Dask processing error: {str(e)}"
            }
    
    async def _process_csv_chunks(self, file_path: Path, encoding: str, separator: str, processing_id: str) -> AsyncGenerator[Dict[str, Any], None]:
        """Process CSV file in chunks for memory efficiency"""
        try:
            chunk_size = MAX_ROWS_PER_CHUNK
            chunks_processed = 0
            total_rows = 0
            
            for chunk in pd.read_csv(file_path, encoding=encoding, sep=separator, chunksize=chunk_size):
                chunks_processed += 1
                total_rows += len(chunk)
                
                self.processing_status[processing_id].update({
                    "progress": min(90, chunks_processed * 10),
                    "message": f"Processed {total_rows:,} rows in {chunks_processed} chunks"
                })
                
                if chunks_processed == 1:
                    # Analyze first chunk for structure
                    yield {
                        "type": "chunk_analysis",
                        "chunk_number": chunks_processed,
                        "rows_in_chunk": len(chunk),
                        "total_rows_so_far": total_rows,
                        "column_info": self._analyze_columns(chunk),
                        "data_preview": chunk.head(5).to_dict('records')
                    }
            
            yield {
                "type": "complete",
                "source_type": "csv_chunks",
                "total_chunks": chunks_processed,
                "total_rows": total_rows,
                "processing_time": time.time() - self.processing_status[processing_id]["start_time"]
            }
            
        except Exception as e:
            yield {
                "type": "error",
                "message": f"Chunk processing error: {str(e)}"
            }
    
    async def _stream_large_json(self, file_path: Path, encoding: str, processing_id: str) -> AsyncGenerator[Dict[str, Any], None]:
        """Stream process large JSON files"""
        try:
            # For large JSON files, attempt to parse line by line if it's JSON Lines format
            line_count = 0
            parsed_objects = 0
            
            with open(file_path, 'r', encoding=encoding) as f:
                for line_num, line in enumerate(f, 1):
                    line = line.strip()
                    if line:
                        try:
                            obj = json.loads(line)
                            parsed_objects += 1
                            
                            if line_num % 10000 == 0:
                                self.processing_status[processing_id].update({
                                    "progress": min(90, (line_num / 100000) * 90),
                                    "message": f"Processed {parsed_objects:,} JSON objects"
                                })
                                
                                yield {
                                    "type": "progress",
                                    "lines_processed": line_num,
                                    "objects_parsed": parsed_objects,
                                    "progress": min(90, (line_num / 100000) * 90)
                                }
                        
                        except json.JSONDecodeError:
                            continue
                    
                    line_count = line_num
            
            yield {
                "type": "complete",
                "source_type": "json_stream",
                "total_lines": line_count,
                "parsed_objects": parsed_objects,
                "processing_time": time.time() - self.processing_status[processing_id]["start_time"]
            }
            
        except Exception as e:
            yield {
                "type": "error",
                "message": f"JSON streaming error: {str(e)}"
            }

file_processor_instance = LargeFileProcessor()

# Performance decorator
def track_performance(func):
    @wraps(func)
    async def wrapper(*args, **kwargs):
        start_time = time.time()
        try:
            result = await func(*args, **kwargs)
            duration = time.time() - start_time
            monitor.record_request(func.__name__, duration, True)
            return result
        except Exception as e:
            duration = time.time() - start_time
            monitor.record_request(func.__name__, duration, False)
            raise e
    return wrapper

# Advanced data analysis with caching
class DataAnalyzer:
    def __init__(self):
        self.analysis_cache = {}
    
    @lru_cache(maxsize=1000)
    def calculate_statistics(self, data_hash: str, column: str, operation: str):
        # This would be called with actual data in practice
        pass
    
    async def analyze_data_advanced(self, data: List[Dict], question: str) -> Dict:
        """Advanced data analysis with multiple statistical methods"""
        if not data:
            return {"answer": "No data provided.", "confidence": 0}
        
        # Convert to DataFrame for faster operations
        df = pd.DataFrame(data)
        question_lower = question.lower()
        
        # Enhanced pattern matching with confidence scoring
        patterns = {
            r'average|mean': self._calculate_average,
            r'sum|total': self._calculate_sum,
            r'count|number': self._calculate_count,
            r'unique|distinct': self._get_unique_values,
            r'correlation': self._calculate_correlation,
            r'trend|pattern': self._analyze_trend,
            r'distribution': self._analyze_distribution,
            r'outlier|anomaly': self._detect_outliers,
            r'regression|predict': self._simple_regression,
            r'group by|groupby': self._group_analysis
        }
        
        import re
        for pattern, func in patterns.items():
            if re.search(pattern, question_lower):
                try:
                    result = await asyncio.get_event_loop().run_in_executor(
                        cpu_executor, func, df, question_lower
                    )
                    return result
                except Exception as e:
                    continue
        
        return {"answer": "I couldn't understand that question. Try asking about averages, sums, trends, or correlations.", "confidence": 0}
    
    def _calculate_average(self, df: pd.DataFrame, question: str) -> Dict:
        columns = self._extract_columns(df, question)
        results = {}
        for col in columns:
            if col in df.columns and pd.api.types.is_numeric_dtype(df[col]):
                avg = df[col].mean()
                results[col] = {
                    "average": round(avg, 2),
                    "std": round(df[col].std(), 2),
                    "count": len(df[col].dropna())
                }
        
        if results:
            return {
                "answer": f"Statistical analysis complete for {', '.join(results.keys())}",
                "results": results,
                "confidence": 0.95
            }
        return {"answer": "No numeric columns found for average calculation.", "confidence": 0}
    
    def _calculate_sum(self, df: pd.DataFrame, question: str) -> Dict:
        columns = self._extract_columns(df, question)
        results = {}
        for col in columns:
            if col in df.columns and pd.api.types.is_numeric_dtype(df[col]):
                total = df[col].sum()
                results[col] = {
                    "sum": round(total, 2),
                    "min": round(df[col].min(), 2),
                    "max": round(df[col].max(), 2)
                }
        
        if results:
            return {
                "answer": f"Sum calculation complete for {', '.join(results.keys())}",
                "results": results,
                "confidence": 0.95
            }
        return {"answer": "No numeric columns found for sum calculation.", "confidence": 0}
    
    def _calculate_correlation(self, df: pd.DataFrame, question: str) -> Dict:
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        if len(numeric_cols) < 2:
            return {"answer": "Need at least 2 numeric columns for correlation analysis.", "confidence": 0}
        
        corr_matrix = df[numeric_cols].corr()
        
        # Find strongest correlations
        correlations = []
        for i in range(len(corr_matrix.columns)):
            for j in range(i+1, len(corr_matrix.columns)):
                col1, col2 = corr_matrix.columns[i], corr_matrix.columns[j]
                corr_val = corr_matrix.loc[col1, col2]
                if not pd.isna(corr_val):
                    correlations.append({
                        "variables": f"{col1} vs {col2}",
                        "correlation": round(corr_val, 3),
                        "strength": self._correlation_strength(abs(corr_val))
                    })
        
        correlations.sort(key=lambda x: abs(x["correlation"]), reverse=True)
        
        return {
            "answer": "Correlation analysis complete",
            "correlations": correlations[:10],  # Top 10 correlations
            "confidence": 0.9
        }
    
    def _analyze_trend(self, df: pd.DataFrame, question: str) -> Dict:
        columns = self._extract_columns(df, question)
        trends = {}
        
        for col in columns:
            if col in df.columns and pd.api.types.is_numeric_dtype(df[col]):
                values = df[col].dropna()
                if len(values) > 2:
                    # Simple trend analysis
                    x = np.arange(len(values))
                    z = np.polyfit(x, values, 1)
                    slope = z[0]
                    
                    trends[col] = {
                        "slope": round(slope, 4),
                        "direction": "increasing" if slope > 0 else "decreasing" if slope < 0 else "stable",
                        "strength": abs(slope),
                        "r_squared": round(np.corrcoef(x, values)[0, 1]**2, 3) if len(values) > 1 else 0
                    }
        
        if trends:
            return {
                "answer": f"Trend analysis complete for {', '.join(trends.keys())}",
                "trends": trends,
                "confidence": 0.85
            }
        return {"answer": "No suitable numeric data found for trend analysis.", "confidence": 0}
    
    def _detect_outliers(self, df: pd.DataFrame, question: str) -> Dict:
        columns = self._extract_columns(df, question)
        outliers = {}
        
        for col in columns:
            if col in df.columns and pd.api.types.is_numeric_dtype(df[col]):
                Q1 = df[col].quantile(0.25)
                Q3 = df[col].quantile(0.75)
                IQR = Q3 - Q1
                lower_bound = Q1 - 1.5 * IQR
                upper_bound = Q3 + 1.5 * IQR
                
                outlier_mask = (df[col] < lower_bound) | (df[col] > upper_bound)
                outlier_values = df[col][outlier_mask].tolist()
                
                outliers[col] = {
                    "count": len(outlier_values),
                    "percentage": round(len(outlier_values) / len(df[col]) * 100, 2),
                    "values": outlier_values[:10],  # Show first 10 outliers
                    "bounds": {"lower": round(lower_bound, 2), "upper": round(upper_bound, 2)}
                }
        
        if outliers:
            return {
                "answer": f"Outlier analysis complete for {', '.join(outliers.keys())}",
                "outliers": outliers,
                "confidence": 0.9
            }
        return {"answer": "No suitable numeric data found for outlier detection.", "confidence": 0}
    
    def _extract_columns(self, df: pd.DataFrame, question: str) -> List[str]:
        """Extract column names mentioned in the question"""
        words = question.lower().split()
        columns = []
        
        for col in df.columns:
            if col.lower() in question.lower():
                columns.append(col)
        
        # If no specific columns mentioned, use all numeric columns
        if not columns:
            columns = df.select_dtypes(include=[np.number]).columns.tolist()
        
        return columns
    
    def _correlation_strength(self, corr_val: float) -> str:
        if corr_val >= 0.7:
            return "Strong"
        elif corr_val >= 0.3:
            return "Moderate"
        elif corr_val >= 0.1:
            return "Weak"
        else:
            return "Very Weak"
    
    def _get_unique_values(self, df: pd.DataFrame, question: str) -> Dict:
        columns = self._extract_columns(df, question)
        if not columns:
            columns = [col for col in df.columns if df[col].dtype == 'object'][:5]  # Limit to 5 categorical columns
        
        unique_data = {}
        for col in columns[:5]:  # Limit to 5 columns
            if col in df.columns:
                unique_vals = df[col].unique()
                unique_data[col] = {
                    "count": len(unique_vals),
                    "values": unique_vals.tolist()[:20] if len(unique_vals) <= 20 else unique_vals.tolist()[:20] + ["...more"]
                }
        
        if unique_data:
            return {
                "answer": f"Unique values analysis for {', '.join(unique_data.keys())}",
                "unique_data": unique_data,
                "confidence": 0.95
            }
        return {"answer": "No suitable columns found for unique values analysis.", "confidence": 0}
    
    def _calculate_count(self, df: pd.DataFrame, question: str) -> Dict:
        total_rows = len(df)
        total_cols = len(df.columns)
        
        return {
            "answer": f"Dataset contains {total_rows} rows and {total_cols} columns",
            "statistics": {
                "total_rows": total_rows,
                "total_columns": total_cols,
                "memory_usage": f"{df.memory_usage(deep=True).sum() / 1024:.2f} KB",
                "null_values": df.isnull().sum().to_dict()
            },
            "confidence": 1.0
        }
    
    def _analyze_distribution(self, df: pd.DataFrame, question: str) -> Dict:
        columns = self._extract_columns(df, question)
        distributions = {}
        
        for col in columns:
            if col in df.columns and pd.api.types.is_numeric_dtype(df[col]):
                desc = df[col].describe()
                distributions[col] = {
                    "mean": round(desc['mean'], 2),
                    "median": round(desc['50%'], 2),
                    "std": round(desc['std'], 2),
                    "min": round(desc['min'], 2),
                    "max": round(desc['max'], 2),
                    "skewness": round(df[col].skew(), 3),
                    "kurtosis": round(df[col].kurtosis(), 3)
                }
        
        if distributions:
            return {
                "answer": f"Distribution analysis complete for {', '.join(distributions.keys())}",
                "distributions": distributions,
                "confidence": 0.9
            }
        return {"answer": "No suitable numeric data found for distribution analysis.", "confidence": 0}
    
    def _simple_regression(self, df: pd.DataFrame, question: str) -> Dict:
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        if len(numeric_cols) < 2:
            return {"answer": "Need at least 2 numeric columns for regression analysis.", "confidence": 0}
        
        # Simple linear regression between first two numeric columns
        x_col, y_col = numeric_cols[0], numeric_cols[1]
        x_data = df[x_col].dropna()
        y_data = df[y_col].dropna()
        
        if len(x_data) > 2 and len(y_data) > 2:
            # Align the data
            common_idx = df[x_col].dropna().index.intersection(df[y_col].dropna().index)
            x_values = df.loc[common_idx, x_col].values
            y_values = df.loc[common_idx, y_col].values
            
            if len(x_values) > 2:
                coeffs = np.polyfit(x_values, y_values, 1)
                r_squared = np.corrcoef(x_values, y_values)[0, 1]**2
                
                return {
                    "answer": f"Linear regression: {y_col} vs {x_col}",
                    "regression": {
                        "equation": f"y = {coeffs[0]:.4f}x + {coeffs[1]:.4f}",
                        "slope": round(coeffs[0], 4),
                        "intercept": round(coeffs[1], 4),
                        "r_squared": round(r_squared, 3),
                        "variables": {"x": x_col, "y": y_col}
                    },
                    "confidence": 0.8
                }
        
        return {"answer": "Insufficient data for regression analysis.", "confidence": 0}
    
    def _group_analysis(self, df: pd.DataFrame, question: str) -> Dict:
        categorical_cols = df.select_dtypes(include=['object']).columns
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        
        if len(categorical_cols) == 0 or len(numeric_cols) == 0:
            return {"answer": "Need both categorical and numeric columns for group analysis.", "confidence": 0}
        
        # Group by first categorical column and analyze first numeric column
        group_col = categorical_cols[0]
        value_col = numeric_cols[0]
        
        grouped = df.groupby(group_col)[value_col].agg(['count', 'mean', 'sum', 'std']).round(2)
        
        return {
            "answer": f"Group analysis: {value_col} by {group_col}",
            "group_analysis": {
                "grouped_by": group_col,
                "analyzed_column": value_col,
                "results": grouped.to_dict('index')
            },
            "confidence": 0.85
        }

analyzer = DataAnalyzer()

# File paths
DASHBOARD_VIEWS_FILE = 'dashboard_views.json'
ALERTS_FILE = 'alerts.json'
HYPERLOCAL_DATA_FILE = 'public/data/hyperlocal-data.json'

# Pydantic models for request/response
class AnalyzeRequest(BaseModel):
    data: List[Dict[str, Any]]
    question: str

class ForecastRequest(BaseModel):
    data: List[Dict[str, Any]]
    periods: Optional[int] = 5

class DashboardView(BaseModel):
    name: str
    config: Dict[str, Any]

class Alert(BaseModel):
    name: str
    condition: str
    value: float
    email: Optional[str] = None

class HyperlocalLocation(BaseModel):
    pincode: str
    neighborhood: str
    sales: Optional[int] = 0
    impressions: Optional[int] = 0
    conversions: Optional[int] = 0
    conversionRate: Optional[float] = 0
    avgOrderValue: Optional[float] = 0
    productsSold: Optional[int] = 0
    topProducts: Optional[List[str]] = []
    demographics: Optional[List[Dict[str, Any]]] = []
    timeOfDay: Optional[List[Dict[str, Any]]] = []

# Utility functions with caching and optimization
_cache = {}
_cache_timeout = {}

async def load_hyperlocal_data():
    """Load hyperlocal data from JSON file with caching"""
    cache_key = "hyperlocal_data"
    current_time = datetime.now().timestamp()
    
    # Check cache (cache for 30 seconds)
    if (cache_key in _cache and 
        cache_key in _cache_timeout and 
        current_time - _cache_timeout[cache_key] < 30):
        return _cache[cache_key]
    
    try:
        if os.path.exists(HYPERLOCAL_DATA_FILE):
            with open(HYPERLOCAL_DATA_FILE, 'r', encoding='utf-8') as f:
                data = json.load(f)
                _cache[cache_key] = data
                _cache_timeout[cache_key] = current_time
                return data
    except Exception as e:
        print(f'Error loading hyperlocal data: {e}')
    return []

async def save_hyperlocal_data(data):
    """Save hyperlocal data to JSON file asynchronously"""
    try:
        # Clear cache
        _cache.pop("hyperlocal_data", None)
        _cache_timeout.pop("hyperlocal_data", None)
        
        # Ensure directory exists
        os.makedirs(os.path.dirname(HYPERLOCAL_DATA_FILE), exist_ok=True)
        
        # Use thread pool for file I/O
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(io_executor, _save_json_sync, HYPERLOCAL_DATA_FILE, data)
        return True
    except Exception as e:
        print(f'Error saving hyperlocal data: {e}')
        return False

def _save_json_sync(file_path, data):
    """Synchronous JSON save for thread pool"""
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, separators=(',', ':'), ensure_ascii=False)

async def load_json_file(file_path):
    """Generic function to load JSON files with caching"""
    cache_key = f"json_{file_path}"
    current_time = datetime.now().timestamp()
    
    # Check cache (cache for 60 seconds for dashboard/alerts)
    if (cache_key in _cache and 
        cache_key in _cache_timeout and 
        current_time - _cache_timeout[cache_key] < 60):
        return _cache[cache_key]
    
    try:
        if os.path.exists(file_path):
            loop = asyncio.get_event_loop()
            data = await loop.run_in_executor(io_executor, _load_json_sync, file_path)
            _cache[cache_key] = data
            _cache_timeout[cache_key] = current_time
            return data
    except Exception as e:
        print(f'Error loading {file_path}: {e}')
    return []

def _load_json_sync(file_path):
    """Synchronous JSON load for thread pool"""
    with open(file_path, 'r', encoding='utf-8') as f:
        return json.load(f)

async def save_json_file(file_path, data):
    """Generic function to save JSON files asynchronously"""
    try:
        # Clear cache
        cache_key = f"json_{file_path}"
        _cache.pop(cache_key, None)
        _cache_timeout.pop(cache_key, None)
        
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(io_executor, _save_json_sync, file_path, data)
        return True
    except Exception as e:
        print(f'Error saving {file_path}: {e}')
        return False

@app.websocket("/ws/realtime")
async def websocket_endpoint(websocket: WebSocket):
    """Real-time data streaming via WebSocket"""
    await manager.connect(websocket)
    try:
        while True:
            # Send real-time updates every 2 seconds
            await asyncio.sleep(2)
            
            # Generate real-time data
            real_time_data = {
                "timestamp": datetime.now().isoformat(),
                "type": "hyperlocal_update",
                "data": await get_hyperlocal_data_internal(),
                "performance": monitor.get_stats()
            }
            
            await websocket.send_json(real_time_data)
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# Enhanced Large File Upload and Processing Endpoints

@app.post("/api/upload/validate")
@track_performance
async def validate_file_upload(file: UploadFile = File(...)):
    """Validate file before upload"""
    try:
        validation_result = await file_processor_instance.validate_file(file)
        return {
            "status": "valid",
            "file_info": validation_result,
            "estimated_processing_time": _estimate_processing_time(file.size),
            "recommendations": _get_upload_recommendations(file.size, validation_result["extension"])
        }
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Validation error: {str(e)}")

@app.post("/api/upload/process")
@track_performance
async def upload_and_process_file(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    options: str = Form("{}"),
    processing_id: str = Form(None)
):
    """Upload and process large files with real-time progress"""
    try:
        # Generate processing ID if not provided
        if not processing_id:
            processing_id = hashlib.md5(f"{file.filename}_{time.time()}".encode()).hexdigest()
        
        # Validate file
        await file_processor_instance.validate_file(file)
        
        # Parse processing options
        try:
            processing_options = json.loads(options) if options else {}
        except json.JSONDecodeError:
            processing_options = {}
        
        # Start background processing
        background_tasks.add_task(
            _process_file_background, 
            file, 
            processing_id, 
            processing_options
        )
        
        return {
            "status": "processing_started",
            "processing_id": processing_id,
            "message": "File upload and processing started",
            "status_endpoint": f"/api/upload/status/{processing_id}",
            "stream_endpoint": f"/api/upload/stream/{processing_id}"
        }
        
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload error: {str(e)}")

@app.get("/api/upload/status/{processing_id}")
@track_performance
async def get_processing_status(processing_id: str):
    """Get current processing status"""
    status = file_processor_instance.processing_status.get(processing_id)
    if not status:
        raise HTTPException(status_code=404, detail="Processing ID not found")
    
    return {
        "processing_id": processing_id,
        **status,
        "system_stats": {
            "memory_usage": psutil.virtual_memory().percent,
            "cpu_usage": psutil.cpu_percent(),
            "available_memory": psutil.virtual_memory().available / (1024**3)  # GB
        }
    }

@app.get("/api/upload/stream/{processing_id}")
@track_performance
async def stream_processing_progress(processing_id: str):
    """Stream real-time processing progress"""
    if processing_id not in file_processor_instance.processing_status:
        raise HTTPException(status_code=404, detail="Processing ID not found")
    
    async def generate_updates():
        last_progress = -1
        start_time = time.time()
        
        while True:
            status = file_processor_instance.processing_status.get(processing_id)
            if not status:
                break
            
            # Only send updates when progress changes
            if status["progress"] != last_progress:
                yield f"data: {json.dumps(status)}\n\n"
                last_progress = status["progress"]
            
            # Break if processing is complete or error
            if status["status"] in ["complete", "error"]:
                break
            
            # Timeout after 10 minutes
            if time.time() - start_time > 600:
                yield f"data: {json.dumps({'status': 'timeout', 'message': 'Processing timeout'})}\n\n"
                break
            
            await asyncio.sleep(1)
    
    return StreamingResponse(
        generate_updates(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "*"
        }
    )

@app.post("/api/upload/chunk")
@track_performance
async def upload_file_chunk(
    chunk: UploadFile = File(...),
    chunk_index: int = Form(...),
    total_chunks: int = Form(...),
    file_id: str = Form(...),
    filename: str = Form(...)
):
    """Handle chunked file uploads for very large files"""
    try:
        chunk_dir = TEMP_DIR / "chunks" / file_id
        chunk_dir.mkdir(parents=True, exist_ok=True)
        
        # Save chunk
        chunk_path = chunk_dir / f"chunk_{chunk_index:04d}"
        async with aiofiles.open(chunk_path, 'wb') as f:
            content = await chunk.read()
            await f.write(content)
        
        # Check if all chunks are uploaded
        uploaded_chunks = len(list(chunk_dir.glob("chunk_*")))
        
        if uploaded_chunks == total_chunks:
            # Reassemble file
            final_file_path = TEMP_DIR / filename
            async with aiofiles.open(final_file_path, 'wb') as final_file:
                for i in range(total_chunks):
                    chunk_path = chunk_dir / f"chunk_{i:04d}"
                    async with aiofiles.open(chunk_path, 'rb') as chunk_file:
                        chunk_data = await chunk_file.read()
                        await final_file.write(chunk_data)
            
            # Cleanup chunks
            shutil.rmtree(chunk_dir)
            
            return {
                "status": "complete",
                "message": "All chunks uploaded and file assembled",
                "file_path": str(final_file_path),
                "ready_for_processing": True
            }
        
        return {
            "status": "chunk_received",
            "chunk_index": chunk_index,
            "total_chunks": total_chunks,
            "uploaded_chunks": uploaded_chunks,
            "progress": (uploaded_chunks / total_chunks) * 100
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chunk upload error: {str(e)}")

@app.delete("/api/upload/cancel/{processing_id}")
@track_performance
async def cancel_processing(processing_id: str):
    """Cancel ongoing file processing"""
    if processing_id in file_processor_instance.processing_status:
        file_processor_instance.processing_status[processing_id] = {
            "status": "cancelled",
            "progress": 0,
            "message": "Processing cancelled by user"
        }
        return {"status": "cancelled", "processing_id": processing_id}
    else:
        raise HTTPException(status_code=404, detail="Processing ID not found")

@app.get("/api/upload/memory-stats")
@track_performance
async def get_memory_stats():
    """Get current system memory statistics"""
    memory = psutil.virtual_memory()
    return {
        "total_memory_gb": memory.total / (1024**3),
        "available_memory_gb": memory.available / (1024**3),
        "used_memory_gb": memory.used / (1024**3),
        "memory_percent": memory.percent,
        "recommended_max_file_size_mb": (memory.available * 0.5) / (1024**2),  # 50% of available
        "current_temp_files": len(list(TEMP_DIR.glob("*"))),
        "temp_dir_size_mb": sum(f.stat().st_size for f in TEMP_DIR.rglob('*') if f.is_file()) / (1024**2)
    }

# Helper functions for file processing

async def _process_file_background(file: UploadFile, processing_id: str, options: Dict[str, Any]):
    """Background task for file processing"""
    try:
        async for result in file_processor_instance.process_large_file(file, processing_id):
            # Broadcast progress via WebSocket if available
            await manager.broadcast({
                "type": "file_processing_update",
                "processing_id": processing_id,
                "result": result
            })
    except Exception as e:
        file_processor_instance.processing_status[processing_id] = {
            "status": "error",
            "progress": 0,
            "message": f"Background processing error: {str(e)}"
        }

def _estimate_processing_time(file_size: int) -> Dict[str, Any]:
    """Estimate processing time based on file size"""
    # Rough estimates based on file size (in seconds)
    base_time = max(1, file_size / (10 * 1024 * 1024))  # 10MB/sec base rate
    
    return {
        "estimated_seconds": int(base_time),
        "estimated_human": f"{int(base_time // 60)}m {int(base_time % 60)}s" if base_time > 60 else f"{int(base_time)}s",
        "confidence": "medium",
        "factors": [
            "File size and format",
            "Current system load",
            "Data complexity"
        ]
    }

def _get_upload_recommendations(file_size: int, file_extension: str) -> List[str]:
    """Get recommendations for file upload"""
    recommendations = []
    
    if file_size > 100 * 1024 * 1024:  # > 100MB
        recommendations.append("Consider using chunked upload for better reliability")
        recommendations.append("Ensure stable internet connection for large files")
    
    if file_extension in ['.xlsx', '.xls']:
        recommendations.append("Excel files may take longer to process than CSV files")
        recommendations.append("Consider converting to CSV for faster processing")
    
    if file_size > 50 * 1024 * 1024:  # > 50MB
        recommendations.append("Processing will be done in chunks to maintain system responsiveness")
        recommendations.append("You can monitor progress in real-time")
    
    memory = psutil.virtual_memory()
    if file_size > memory.available * 0.3:  # > 30% of available memory
        recommendations.append("Large file detected - using memory-efficient processing")
        recommendations.append("Consider closing other applications to free up memory")
    
    return recommendations

@app.get("/api/stream/hyperlocal")
async def stream_hyperlocal_data():
    """Stream hyperlocal data updates"""
    async def generate_data():
        while True:
            data = await get_hyperlocal_data_internal()
            yield f"data: {json.dumps(data)}\n\n"
            await asyncio.sleep(1)
    
    return StreamingResponse(
        generate_data(),
        media_type="text/plain",
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive"}
    )

@app.get("/api/performance/stats")
@track_performance
async def get_performance_stats():
    """Get real-time performance statistics"""
    return monitor.get_stats()

@app.get("/api/performance/health")
async def health_check():
    """Advanced health check with system metrics"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "uptime": time.time() - monitor.start_time,
        "version": "3.0.0",
        "cache_size": len(cache.cache),
        "active_connections": len(manager.active_connections),
        "memory_usage": {
            "cache_entries": len(cache.cache),
            "websocket_connections": len(manager.active_connections)
        }
    }

async def get_hyperlocal_data_internal():
    """Internal function to get hyperlocal data with caching"""
    cache_key = "hyperlocal_data"
    cached_data = cache.get(cache_key)
    
    if cached_data is not None:
        return cached_data
    
    try:
        data = await load_hyperlocal_data()
        
        # Add real-time timestamp and simulate variations
        updated_data = []
        for location in data:
            updated_location = location.copy()
            updated_location['timestamp'] = datetime.now().isoformat()
            
            # Simulate real-time variations with more sophisticated patterns
            time_factor = math.sin(time.time() / 60) * 0.1  # Hourly pattern
            random_factor = (random.random() - 0.5) * 0.2  # Random variation
            total_factor = 1 + time_factor + random_factor
            
            if 'sales' in location:
                updated_location['sales'] = max(0, math.floor(location['sales'] * total_factor))
            if 'conversions' in location:
                updated_location['conversions'] = max(0, math.floor(location['conversions'] * total_factor))
            if 'impressions' in location:
                updated_location['impressions'] = max(0, math.floor(location['impressions'] * total_factor))
            
            # Add performance metrics
            updated_location['performance_score'] = round(random.uniform(0.7, 1.0), 2)
            updated_location['engagement_rate'] = round(random.uniform(0.1, 0.3), 3)
            
            updated_data.append(updated_location)
        
        # Cache the result for 30 seconds
        cache.set(cache_key, updated_data)
        
        # Broadcast to WebSocket clients
        await manager.broadcast({
            "type": "data_update",
            "data": updated_data,
            "timestamp": datetime.now().isoformat()
        })
        
        return updated_data
    except Exception as e:
        print(f"Error fetching hyperlocal data: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch hyperlocal data")

@app.get("/api/hyperlocal-data")
@track_performance
async def get_hyperlocal_data():
    """Get hyperlocal data with real-time variations and caching"""
    data = await get_hyperlocal_data_internal()
    print(f"📍 Serving hyperlocal data for {len(data)} locations (cached: {cache.get('hyperlocal_data') is not None})")
    return data

@app.patch("/api/hyperlocal-data/{pincode}")
async def update_hyperlocal_data(pincode: str, updates: Dict[str, Any]):
    """Update specific location data - OPTIMIZED"""
    try:
        data = await load_hyperlocal_data()
        
        # Use enumerate for better performance
        for i, loc in enumerate(data):
            if loc.get('pincode') == pincode:
                # Update in place for better memory efficiency
                data[i] = {**loc, **updates, 'timestamp': datetime.now().isoformat()}
                
                if await save_hyperlocal_data(data):
                    return {"success": True, "data": data[i]}
                else:
                    raise HTTPException(status_code=500, detail="Failed to save data")
        
        raise HTTPException(status_code=404, detail="Location not found")
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error updating hyperlocal data: {e}")
        raise HTTPException(status_code=500, detail="Failed to update hyperlocal data")

@app.post("/api/hyperlocal-data")
async def add_hyperlocal_data(location: HyperlocalLocation):
    """Add new location - OPTIMIZED"""
    try:
        if not location.pincode or not location.neighborhood:
            raise HTTPException(status_code=400, detail="PIN code and neighborhood are required")
        
        data = await load_hyperlocal_data()
        
        # Fast check for existing location
        if any(loc.get('pincode') == location.pincode for loc in data):
            raise HTTPException(status_code=409, detail="Location already exists")
        
        # Create location data efficiently
        location_data = {
            **location.dict(),
            'timestamp': datetime.now().isoformat()
        }
        
        data.append(location_data)
        
        if await save_hyperlocal_data(data):
            return {"success": True, "data": location_data}
        else:
            raise HTTPException(status_code=500, detail="Failed to save data")
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error adding hyperlocal data: {e}")
        raise HTTPException(status_code=500, detail="Failed to add hyperlocal data")

@app.post("/api/analyze")
@track_performance
async def analyze_data(request: AnalyzeRequest):
    """Advanced data analysis with AI-powered insights"""
    try:
        result = await analyzer.analyze_data_advanced(request.data, request.question)
        
        # Cache the result for faster subsequent queries
        cache_key = cache._generate_key(request.data, request.question)
        cache.set(cache_key, result)
        
        return result
    except Exception as e:
        print(f"Analysis error: {e}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.post("/api/analyze/batch")
@track_performance
async def analyze_data_batch(requests: List[AnalyzeRequest]):
    """Batch analysis for multiple questions"""
    try:
        # Process multiple questions concurrently
        tasks = [
            analyzer.analyze_data_advanced(req.data, req.question)
            for req in requests[:10]  # Limit to 10 concurrent analyses
        ]
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Format results
        formatted_results = []
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                formatted_results.append({
                    "question": requests[i].question,
                    "answer": f"Error: {str(result)}",
                    "confidence": 0
                })
            else:
                formatted_results.append({
                    "question": requests[i].question,
                    **result
                })
        
        return {"batch_results": formatted_results}
    except Exception as e:
        print(f"Batch analysis error: {e}")
        raise HTTPException(status_code=500, detail=f"Batch analysis failed: {str(e)}")

@app.post("/api/forecast")
async def forecast_data(request: ForecastRequest):
    """Generate forecast using Python forecast script - OPTIMIZED"""
    data = request.data
    periods = request.periods
    
    if not data or len(data) < 2:
        raise HTTPException(status_code=400, detail="Not enough data for forecasting.")
    
    try:
        # Prepare input for the forecast script
        forecast_input = json.dumps({
            "data": data,
            "periods": periods
        }, separators=(',', ':'))  # Compact JSON
        
        # Run the forecast script asynchronously
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(
            cpu_executor,
            _run_forecast_sync,
            forecast_input
        )
        
        if result['success']:
            return {"forecast": result['data']}
        else:
            raise HTTPException(status_code=500, detail=result['error'])
    
    except Exception as e:
        print(f"Forecast error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

def _run_forecast_sync(forecast_input):
    """Synchronous forecast execution for thread pool"""
    try:
        process = subprocess.Popen(
            [sys.executable, 'forecast.py'],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        stdout, stderr = process.communicate(input=forecast_input, timeout=30)  # 30s timeout
        
        if process.returncode != 0 or stderr:
            return {'success': False, 'error': stderr or "Python script error."}
        
        try:
            forecast_result = json.loads(stdout)
            return {'success': True, 'data': forecast_result}
        except json.JSONDecodeError:
            return {'success': False, 'error': "Failed to parse forecast result."}
    
    except subprocess.TimeoutExpired:
        return {'success': False, 'error': "Forecast computation timed out."}
    except Exception as e:
        return {'success': False, 'error': str(e)}

@app.post("/api/save-dashboard")
async def save_dashboard(view: DashboardView):
    """Save dashboard view - OPTIMIZED"""
    try:
        views = await load_json_file(DASHBOARD_VIEWS_FILE)
        
        view_data = {**view.dict(), 'savedAt': datetime.now().isoformat()}
        views.append(view_data)
        
        if await save_json_file(DASHBOARD_VIEWS_FILE, views):
            return {"success": True}
        else:
            raise HTTPException(status_code=500, detail="Failed to save dashboard view")
    except Exception as e:
        print(f"Error saving dashboard: {e}")
        raise HTTPException(status_code=500, detail="Failed to save dashboard view")

@app.get("/api/load-dashboard")
async def load_dashboard():
    """Load latest dashboard view - OPTIMIZED"""
    try:
        if not os.path.exists(DASHBOARD_VIEWS_FILE):
            return {"view": None}
        
        views = await load_json_file(DASHBOARD_VIEWS_FILE)
        latest = views[-1] if views else None
        return {"view": latest}
    except Exception as e:
        print(f"Error loading dashboard: {e}")
        raise HTTPException(status_code=500, detail="Failed to load dashboard views")

@app.post("/api/alerts")
async def save_alert(alert: Alert):
    """Save alert - OPTIMIZED"""
    try:
        alerts = await load_json_file(ALERTS_FILE)
        
        alert_data = {**alert.dict(), 'savedAt': datetime.now().isoformat()}
        alerts.append(alert_data)
        
        if await save_json_file(ALERTS_FILE, alerts):
            return {"success": True}
        else:
            raise HTTPException(status_code=500, detail="Failed to save alert")
    except Exception as e:
        print(f"Error saving alert: {e}")
        raise HTTPException(status_code=500, detail="Failed to save alert")

@app.get("/api/alerts")
async def get_alerts():
    """Get all alerts - OPTIMIZED"""
    try:
        if not os.path.exists(ALERTS_FILE):
            return {"alerts": []}
        
        alerts = await load_json_file(ALERTS_FILE)
        return {"alerts": alerts}
    except Exception as e:
        print(f"Error loading alerts: {e}")
        raise HTTPException(status_code=500, detail="Failed to load alerts")

@app.get("/")
async def root():
    """Health check endpoint - OPTIMIZED"""
    return {
        "message": "FlexBI High-Performance Python Backend", 
        "status": "healthy",
        "version": "2.0.0-optimized",
        "performance": "maximum"
    }

# Performance monitoring endpoint
@app.get("/api/health")
async def health_check():
    """Detailed health check with performance metrics"""
    import gc
    
    return {
        "status": "healthy",
        "cache_size": len(_cache),
        "gc_count": len(gc.get_objects()),
        "uptime": "running",
        "optimization": "enabled",
        "performance": "maximum"
    }

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting FlexBI High-Performance Python Backend on http://localhost:3002")
    print("⚡ Optimizations enabled: Async I/O, Caching, GZip, Thread Pool, Large File Processing")
    
    # Production-optimized configuration
    uvicorn.run(
        app, 
        host="0.0.0.0", 
        port=3002,
        # Performance optimizations
        loop="asyncio",
        access_log=False,  # Disable access logs for better performance
        log_level="warning",  # Reduce logging overhead
        # Optimize timeouts
        timeout_keep_alive=75
    )
