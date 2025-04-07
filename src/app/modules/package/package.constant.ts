export const mapInterval = (
  interval: 'day' | 'week' | 'month' | 'year' | 'half-year',
): 'day' | 'week' | 'month' | 'year' => {
  if (interval === 'half-year') {
    return 'month';
  }
  return interval;
};
