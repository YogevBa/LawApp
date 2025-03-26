import { ViewStyle } from 'react-native';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  type?: 'primary' | 'secondary' | 'outline';
  width?: string | number;
  disabled?: boolean;
  style?: ViewStyle;
}

declare const Button: React.FC<ButtonProps>;

export default Button;