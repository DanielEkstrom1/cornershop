interface Route {
  path: string;
  render: () => string;
  setup?: () => void;
}

class Router {
  private routes: Route[] = [];
  private currentPath: string = "/";

  constructor() {
    this.handlePopState = this.handlePopState.bind(this);
    window.addEventListener("popstate", this.handlePopState);
    this.setupLinkHandlers();
  }

  addRoute(path: string, render: () => string, setup?: () => void): void {
    this.routes.push({ path, render, setup });
  }

  private setupLinkHandlers(): void {
    document.addEventListener("click", (e) => {
      const target = e.target as HTMLElement;
      const link = target.closest("a");
      
      if (link && link.href && link.origin === window.location.origin) {
        e.preventDefault();
        const path = new URL(link.href).pathname;
        this.navigate(path);
      }
    });
  }

  navigate(path: string): void {
    if (path !== this.currentPath) {
      this.currentPath = path;
      history.pushState({}, "", path);
      this.render();
    }
  }

  private handlePopState(): void {
    this.currentPath = window.location.pathname;
    this.render();
  }

  private render(): void {
    const route = this.routes.find(r => r.path === this.currentPath) || 
                  this.routes.find(r => r.path === "/");
    
    if (route) {
      const appElement = document.querySelector<HTMLDivElement>("#app")!;
      const content = route.render();
      
      appElement.innerHTML = `
        <div class="min-h-screen bg-base-100">
          <div class="navbar bg-base-200 shadow-lg">
            <div class="flex-1">
              <h1 class="text-xl font-bold">
                <a href="/" class="hover:text-primary">Cornershop Media Player</a>
              </h1>
            </div>
            <div class="flex-none">
              <ul class="menu menu-horizontal px-1">
                <li><a href="/" class="${this.currentPath === "/" ? "active" : ""}">Player</a></li>
                <li><a href="/about" class="${this.currentPath === "/about" ? "active" : ""}">About</a></li>
              </ul>
              <button id="syncplay-btn" class="btn btn-primary ml-4">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                SyncPlay
              </button>
            </div>
          </div>
          ${content}
        </div>
      `;

      // Setup syncplay button handler
      const syncplayBtn = document.querySelector<HTMLButtonElement>("#syncplay-btn");
      if (syncplayBtn) {
        syncplayBtn.onclick = () => {
          console.log("SyncPlay button clicked - placeholder for future implementation");
        };
      }

      // Run route-specific setup
      if (route.setup) {
        route.setup();
      }
    }
  }

  start(): void {
    this.currentPath = window.location.pathname;
    this.render();
  }
}

export default Router;