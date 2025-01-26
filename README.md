# react-native-joystick-lite

A customizable joystick component for React Native with gesture support. Built using `react-native-gesture-handler` and `react-native-reanimated` for smooth and responsive controls.

## Features

- 🎮 Smooth gesture-based joystick control.
- 🎨 Fully customizable size, color, and styles.
- 📱 Works on both Android and iOS.
- ⚡ High performance with reanimated animations.
- 🛠 Easy integration into existing React Native projects.

## Installation

### For Expo Projects:

```bash
yarn add react-native-joystick-lite expo-haptics
```

### For React Native CLI Projects:

```bash
yarn add react-native-joystick-lite
npx react-native link react-native-gesture-handler react-native-reanimated
```

## Usage

```tsx
import React from 'react';
import Joystick from 'react-native-joystick-lite';

const App = () => {
  const handleMove = (data) => {
    console.log('Joystick moved:', data);
  };

  return (
    <Joystick
      onMove={handleMove}
      onEnd={() => console.log('Joystick released')}
      size={200}
      color="#ff5733"
      haptics={true}
    />
  );
};

export default App;
```

## Props

| Prop      | Type     | Default | Description                               |
|-----------|----------|---------|-------------------------------------------|
| `onMove`  | Function | `()`     | Callback when joystick moves.             |
| `onEnd`   | Function | `()`     | Callback when joystick is released.       |
| `size`    | Number   | `150`    | Diameter of the joystick boundary.        |
| `color`   | String   | `#06b6d4`| Joystick color.                           |
| `haptics` | Boolean  | `false`  | Enables haptic feedback (Expo only).      |
| `interval`| Number   | `100`    | Debounce interval for movement callback.  |

## Development

To run the example project:

```bash
cd example
yarn
npx expo start  # or npx react-native run-android
```

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)



## Issues

If you encounter any issues, feel free to [open an issue](https://github.com/ashik112/react-native-joystick-lite/issues).