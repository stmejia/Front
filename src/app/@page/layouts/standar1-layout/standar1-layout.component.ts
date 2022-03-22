import {
  Component,
  OnInit,
  HostListener,
  Input,
} from "@angular/core";
import { DeviceDetectorService } from "ngx-device-detector";
import { Menu } from "../../models/menu";

@Component({
  selector: "app-standar1-layout",
  templateUrl: "./standar1-layout.component.html",
  styleUrls: ["./standar1-layout.component.css"],
})
export class Standar1LayoutComponent implements OnInit {
  modo = "side";
  estado = true;

  @Input() menuItems: Menu[];

  @HostListener("window:resize", ["$event"])
  onResize(event?) {
    if (window.innerWidth > 900) {
      this.modo = "side";
      this.estado = true;
    } else {
      this.modo = "over";
      this.estado = false;
    }
  }

  @HostListener("window:beforeprint", ["$event"])
  onWindowBeforePrint(event?) {
    this.estado = false;
  }

  constructor(private deviceService: DeviceDetectorService) {
    this.onResize();
  }

  ngOnInit(): void { }

  ngOnChanges(changes: any) { }

  clickSideBar(event) {
    if (this.deviceService.isMobile()) {
      this.modo = "over";
      this.estado = false;
    }
  }
}
