import { Store, type NOTIFICATION_TYPE } from 'react-notifications-component';
import 'react-notifications-component/dist/theme.css';
import { makeAutoObservable } from "mobx";
import RootStore from "@stores/RootStore";
// import getAlert, { closeAlertIcon } from "@src/utils/alertUtil";
import { THEME_TYPE, themes } from "@src/themes/ThemeProvider";
import { Column } from '@components/Flex';
import Text from "@components/Text";
import React from 'react';
import SizedBox from '@src/components/SizedBox';
import { Link } from 'react-router-dom';

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

class NotificationStore {
  public rootStore: RootStore;
  _instance?: any;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }

  notify(content: string | React.ReactNode, opts: TNotifyOptions = {}) {
    const theme = themes[this.rootStore.accountStore.selectedTheme];
    const type = opts.type || "info";

    const msg = opts.link ? (
      <Column>
        <Text size="small" type="secondary">
          {content}
        </Text>
        <SizedBox height={12} />
        <Link
          to={opts.link}
          onClick={opts.onClick}
          target="_blank"
          style={{ textDecoration: 'none' }}
        >
          <Text size="small" style={{ color: theme.colors.primary500, fontWeight: 500 }}>
            {opts.linkTitle}
          </Text>
        </Link>
      </Column>
    ) : (
      <Column>
        <Text size="small" type="secondary">
          {content}
        </Text>
      </Column>
    );

    Store.addNotification({
      title: opts.title || "Notification",
      message: msg,
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
