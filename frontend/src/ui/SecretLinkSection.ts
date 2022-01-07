export class SecretLinkSection {

  private readonly root: HTMLElement;
  private readonly link: HTMLTextAreaElement;
  private readonly copyLinkButton: HTMLButtonElement;

  onCopyLink: (link: string) => void;

  constructor(root: HTMLElement) {
    this.root = root;
    this.link = root.querySelector("[data-id='link']");
    this.copyLinkButton = root.querySelector("[data-id='copy-link']")
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    this.copyLinkButton.onclick = () => {
      if (this.onCopyLink) {
        const link = this.link.value;
        this.onCopyLink(link);
      }
    }
  }

  show(link: string) {
    this.link.value = link;
    this.root.classList.remove("hidden");
  }

  hide() {
    this.link.value = "";
    this.root.classList.add("hidden");
  }
}
