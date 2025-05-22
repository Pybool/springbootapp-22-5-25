import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'humanFriendlyDate',
  standalone: true,
})
export class HumanFriendlyDatePipe implements PipeTransform {
  transform(value: string): string {
    if (!value) {
      return 'Invalid date';
    }

    const date = new Date(value);

    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }

    // Format options
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long', // e.g., Monday
      year: 'numeric', // e.g., 2024
      month: 'long', // e.g., December
      day: 'numeric', // e.g., 16
      hour: 'numeric', // e.g., 2 PM
      minute: 'numeric', // e.g., 36
    };

    return date.toLocaleString('en-US', options); // Adjust locale as needed
  }
}
