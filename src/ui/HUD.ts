import { TimeSystem } from '../systems/TimeSystem';

export class HUD {
  private container: HTMLDivElement;
  private timeDisplay: HTMLSpanElement;
  private phaseDisplay: HTMLSpanElement;
  private speedDisplay: HTMLSpanElement;

  constructor(private timeSystem: TimeSystem) {
    this.container = document.createElement('div');
    this.container.style.cssText = `
      position: fixed; top: 16px; left: 16px; z-index: 100;
      background: rgba(0,0,0,0.6); color: #fff; padding: 12px 18px;
      border-radius: 8px; font-family: monospace; font-size: 14px;
      user-select: none; backdrop-filter: blur(4px);
    `;

    this.timeDisplay = document.createElement('span');
    this.timeDisplay.style.cssText = 'font-size: 20px; font-weight: bold;';
    this.phaseDisplay = document.createElement('span');
    this.phaseDisplay.style.cssText = 'margin-left: 10px; opacity: 0.8;';
    this.speedDisplay = document.createElement('span');
    this.speedDisplay.style.cssText = 'margin-left: 10px; opacity: 0.8;';

    const timeRow = document.createElement('div');
    timeRow.appendChild(this.timeDisplay);
    timeRow.appendChild(this.phaseDisplay);
    timeRow.appendChild(this.speedDisplay);

    const controls = document.createElement('div');
    controls.style.cssText = 'margin-top: 8px; display: flex; gap: 6px;';

    const speeds = [
      { label: '⏸', speed: 0 },
      { label: '1×', speed: 1 },
      { label: '2×', speed: 2 },
      { label: '5×', speed: 5 },
      { label: '10×', speed: 10 },
    ];

    for (const s of speeds) {
      const btn = document.createElement('button');
      btn.textContent = s.label;
      btn.style.cssText = `
        background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.3);
        color: #fff; padding: 4px 10px; border-radius: 4px; cursor: pointer;
        font-family: monospace; font-size: 12px;
      `;
      btn.addEventListener('click', () => {
        if (s.speed === 0) {
          this.timeSystem.togglePause();
        } else {
          if (this.timeSystem.isPaused()) this.timeSystem.togglePause();
          this.timeSystem.setSpeed(s.speed);
        }
      });
      controls.appendChild(btn);
    }

    this.container.appendChild(timeRow);
    this.container.appendChild(controls);
    document.body.appendChild(this.container);
  }

  update(): void {
    this.timeDisplay.textContent = this.timeSystem.getTimeString();
    this.phaseDisplay.textContent = this.timeSystem.getDayPhase();

    if (this.timeSystem.isPaused()) {
      this.speedDisplay.textContent = '(paused)';
    } else {
      this.speedDisplay.textContent = `${this.timeSystem.getSpeed()}×`;
    }
  }
}
