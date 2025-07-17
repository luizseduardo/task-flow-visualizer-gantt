
import { addDays, isWeekend, differenceInDays, eachDayOfInterval } from 'date-fns';

export const addWorkingDays = (startDate: Date, workingDays: number): Date => {
  let currentDate = new Date(startDate);
  let daysAdded = 0;
  
  while (daysAdded < workingDays) {
    currentDate = addDays(currentDate, 1);
    if (!isWeekend(currentDate)) {
      daysAdded++;
    }
  }
  
  return currentDate;
};

export const calculateWorkingDays = (startDate: Date, endDate: Date): number => {
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  return days.filter(day => !isWeekend(day)).length;
};

export const getWorkingDaysBetween = (startDate: Date, endDate: Date): number => {
  if (startDate > endDate) return 0;
  
  const totalDays = differenceInDays(endDate, startDate) + 1;
  const weekends = eachDayOfInterval({ start: startDate, end: endDate })
    .filter(day => isWeekend(day)).length;
  
  return totalDays - weekends;
};
