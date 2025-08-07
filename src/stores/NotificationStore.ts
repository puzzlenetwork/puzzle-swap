import { Store, type NOTIFICATION_TYPE } from 'react-notifications-component';
import 'react-notifications-component/dist/theme.css';
import { makeAutoObservable } from "mobx";
import RootStore from "@stores/RootStore";
// import getAlert, { closeAlertIcon } from "@src/utils/alertUtil";
import { THEME_TYPE } from "@src/themes/ThemeProvider";

export type TNotifyOptions = Partial<{
  duration: number;
  closable: boolean;
  key: string;

  theme?: THEME_TYPE;
  type: NOTIFICATION_TYPE;
  link?: string;
  linkTitle?: string;
  title: string;
  onClick?: () => void;
  onClickText?: string;
  style: { [key: string]: string | number };
}>;

const style = {
  boxShadow: "0px 8px 24px rgba(54, 56, 112, 0.16)",
  borderRadius: 12,
  padding: 16
};

const styles = {
  error: {
    ...style
  },
  warning: {
    ...style
  },
  info: {
    ...style
  },
  success: {
    ...style
  }
};

class NotificationStore {
  public rootStore: RootStore;
  _instance?: any;

  constructor(rootStore: RootStore) {
    const width = window.innerWidth;
    const mobileStyle = {
      top: 80,
      right: 16,
      left: 16,
      zIndex: "1000000000000000000"
    };
    const desktopStyle = {
      top: 96,
      right: 16,
      left: width - 320 - 16,
      zIndex: "1000000000000000000"
    };
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }

  notify(content: string, opts: TNotifyOptions = {}) {
    console.log("notify", content, opts);
    const type = opts.type || "info";

    Store.addNotification({
      title: opts.title || "Notification",
      message: content,
      type: type,
      insert: "top",
      container: "top-right",
      slidingExit: {
        duration: 200,
        timingFunction: 'ease-out',
        delay: 0
      },
      dismiss: {
        duration: opts.duration ?? 5000,
        onScreen: true,
        pauseOnHover: true,
        showIcon: opts.closable !== false
      },
      userDefinedTypes: opts.style ? [{ name: 'custom-style', htmlClasses: [opts.style.toString()] }] : undefined,
    });
  }
}

export default NotificationStore;
