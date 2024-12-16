import {
  MetricType,
  onCLS,
  onFCP,
  onFID,
  onLCP,
  onTTFB,
} from 'web-vitals/attribution';

const reportWebVitals = (onPerfEntry?: (value: MetricType) => void) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    onCLS(onPerfEntry);
    onFCP(onPerfEntry);
    onFID(onPerfEntry);
    onLCP(onPerfEntry);
    onTTFB(onPerfEntry);
  }
};

export default reportWebVitals;
