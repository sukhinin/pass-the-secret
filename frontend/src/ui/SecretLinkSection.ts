export class SecretLinkSection {

  private readonly root: HTMLElement;
  private readonly link: HTMLTextAreaElement;
  private readonly copyLinkButton: HTMLButtonElement;

  onCopyLink: (link: string) => Promise<void>;

  constructor(root: HTMLElement) {
    this.root = root;
    this.link = root.querySelector("[data-id='link']");
    this.copyLinkButton = root.querySelector("[data-id='copy-link']");
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    this.copyLinkButton.onclick = async () => {
      if (this.onCopyLink) {
        try {
          this.copyLinkButton.disabled = true;
          const link = this.link.value;
          await this.onCopyLink(link);
        } finally {
          this.copyLinkButton.disabled = false;
        }
      }
    };
  }

  show(link: string) {
    this.link.value = link;
    this.root.classList.remove("hidden");
    this.copyLinkButton.focus();
  }

  hide() {
    this.link.value = "";
    this.root.classList.add("hidden");
  }
}
