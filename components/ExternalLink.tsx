import { Link } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { type ComponentProps } from 'react';
import { Platform, GestureResponderEvent } from 'react-native';

// Define specific props for our ExternalLink component
type Props = Omit<ComponentProps<typeof Link>, 'href' | 'onPress'> & { 
  href: string;
  onPress?: (event: GestureResponderEvent) => void | Promise<void>;
};

export function ExternalLink({ href, ...rest }: Props) {
  return (
    <Link
      target="_blank"
      {...rest}
      href={href as any}
      onPress={async (event) => {
        if (Platform.OS !== 'web') {
          // Prevent the default behavior of linking to the default browser on native.
          event.preventDefault();
          // Open the link in an in-app browser.
          await WebBrowser.openBrowserAsync(href);
        }
      }}
    />
  );
}
