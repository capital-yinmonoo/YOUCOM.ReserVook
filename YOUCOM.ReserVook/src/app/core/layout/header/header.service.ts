export class HeaderService {

  public visible: boolean;
  public changeableCompany: boolean;

  constructor() {
    this.visible = true;
    this.changeableCompany = true;
  }

  hide() {
    this.visible = false;
  }
  show() {
    this.visible = true;
  }

  lockCompanySeleter() {
    this.changeableCompany = false;
  }
  unlockCompanySelecter() {
    this.changeableCompany = true;
  }
}
