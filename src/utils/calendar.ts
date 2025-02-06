export const getDaysInMonth = (date: Date): Date[] => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  return Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1));
};

export const isToday = (date: Date): boolean => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
};

export const getRandomColor = (): string => {
  const colors = [
    '#F2FCE2',  // Soft Green
    '#FEF7CD',  // Soft Yellow
    '#FEC6A1',  // Soft Orange
    '#E5DEFF',  // Soft Purple
    '#FFDEE2',  // Soft Pink
    '#FDE1D3',  // Soft Peach
    '#D3E4FD'   // Soft Blue
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};