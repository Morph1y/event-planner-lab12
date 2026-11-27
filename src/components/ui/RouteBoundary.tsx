import { Component, type ReactNode } from "react";
import { AsyncState } from "./AsyncState";

export class RouteBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (this.state.failed) {
      return (
        <AsyncState
          kind="error"
          title="Не вдалося відкрити сторінку"
          message="Перевір з’єднання та перезавантаж сторінку, щоб спробувати ще раз."
          onRetry={() => window.location.reload()}
        />
      );
    }
    return this.props.children;
  }
}
