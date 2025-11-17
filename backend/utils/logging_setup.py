import logging
import sys
from typing import Optional

logging.basicConfig(level=logging.WARNING)

EVENT_LOGGER_NAME = "freddyAI.event"
TRACE_LOGGER_NAME = "freddyAI.trace"

def configure_logging(log_file: Optional[str] = None):
    logger = logging.getLogger(EVENT_LOGGER_NAME)
    logger.setLevel(logging.INFO)
    
    # Stream handler (stdout)
    stream_handler = logging.StreamHandler(sys.stdout)
    stream_handler.setLevel(logging.INFO)
    stream_formatter = logging.Formatter("%(asctime)s [%(levelname)s] %(name)s: %(message)s")
    stream_handler.setFormatter(stream_formatter)
    logger.addHandler(stream_handler)
    
    if log_file:
        file_handler = logging.FileHandler(log_file)
        file_handler.setLevel(logging.INFO)
        formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
        file_handler.setFormatter(formatter)
        logger.addHandler(file_handler)
        
    return logger

# configure_trace_logging sets up the trace logger to log to a file if specified
def configure_trace_logging(trace_log_file: Optional[str] = None):
    trace_logger = logging.getLogger(TRACE_LOGGER_NAME)
    trace_logger.setLevel(logging.DEBUG)
    
    # Stream handler (stdout)
    stream_handler = logging.StreamHandler(sys.stdout)
    stream_handler.setLevel(logging.INFO)
    stream_formatter = logging.Formatter("%(asctime)s [%(levelname)s] %(name)s: %(message)s")
    stream_handler.setFormatter(stream_formatter)
    trace_logger.addHandler(stream_handler)
    
    if trace_log_file:
        file_handler = logging.FileHandler(trace_log_file)
        file_handler.setLevel(logging.DEBUG)
        formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
        file_handler.setFormatter(formatter)
        trace_logger.addHandler(file_handler)
        
    return trace_logger
  
logger = configure_logging()
trace_logger = configure_trace_logging()