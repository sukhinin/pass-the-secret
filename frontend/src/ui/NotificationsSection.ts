export class NotificationsSection {
  private readonly root: HTMLElement;
  private readonly document: HTMLDocument;

  constructor(root: HTMLElement) {
    this.root = root;
    this.document = root.ownerDocument;
  }

  displayInfoNotification(text: string) {
    this.displayNotification(text, "notification-info");
  }

  displayErrorNotification(text: string) {
    this.displayNotification(text, "notification-error");
  }

  private displayNotification(text: string, cssClass: string) {
    const node = this.document.createElement("div");
    node.classList.add(cssClass);
    node.style.opacity = "0.0";
    node.innerText = text;
    this.root.appendChild(node);

    setTimeout(() => node.style.opacity = "1.0", 0);
    setTimeout(() => node.style.opacity = "0.0", 3000);
    setTimeout(() => this.root.removeChild(node), 3150);
  }
}
