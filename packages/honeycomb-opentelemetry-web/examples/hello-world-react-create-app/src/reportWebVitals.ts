import {
  MetricType,
  onCLS,
  onFCP,
  onLCP,
  onTTFB,
} from 'web-vitals/attribution';

const reportWebVitals = (onPerfEntry?: (value: MetricType) => void) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    onCLS(onPerfEntry);
    onFCP(onPerfEntry);
    onLCP(onPerfEntry);
    onTTFB(onPerfEntry);
  }
};

export default reportWebVitals;
