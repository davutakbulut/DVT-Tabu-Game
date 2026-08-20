export const triggerHaptic = (type: 'correct' | 'pass' | 'buzzer' | 'click') => {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    try {
      switch (type) {
        case 'correct':
          navigator.vibrate(40);
          break;
        case 'pass':
          navigator.vibrate([20, 20]);
          break;
        case 'buzzer':
          navigator.vibrate([150, 50, 150]);
          break;
        case 'click':
          navigator.vibrate(15);
          break;
      }
    } catch {
      // Ignore vibration errors on unsupported devices
    }
  }
};
