declare module '@react-native-picker/picker' {
  import * as React from 'react';
  import { Component } from 'react';
  import { ViewProps, StyleProp, ViewStyle } from 'react-native';

  export interface PickerItemProps {
    label?: string;
    value?: string | number;
    color?: string;
    enabled?: boolean;
  }

  export class PickerItem extends Component<PickerItemProps> {}

  export interface PickerProps extends ViewProps {
    selectedValue?: string | number;
    onValueChange?: (itemValue: string | number, itemIndex: number) => void;
    style?: StyleProp<ViewStyle>;
    children?: React.ReactNode;
  }

  export class Picker extends Component<PickerProps> {
    static Item: typeof PickerItem;
  }

  export default Picker;
}
