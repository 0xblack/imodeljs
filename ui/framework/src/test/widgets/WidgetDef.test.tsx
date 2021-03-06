/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { expect } from "chai";
import * as React from "react";
import * as sinon from "sinon";
import { BadgeType, WidgetState } from "@bentley/ui-abstract";
import {
  ConfigurableCreateInfo, ConfigurableUiControlType, ConfigurableUiManager, SyncUiEventId, WidgetControl, WidgetDef, WidgetProps,
} from "../../ui-framework";
import { SyncUiEventDispatcher } from "../../ui-framework/syncui/SyncUiEventDispatcher";
import TestUtils from "../TestUtils";

// cSpell:ignore widgetstate

describe("WidgetDef", () => {

  class TestWidget extends WidgetControl {
    constructor(info: ConfigurableCreateInfo, options: any) {
      super(info, options);

      this.reactNode = <div />;
    }
  }

  before(async () => {
    await TestUtils.initializeUiFramework();
    ConfigurableUiManager.registerControl("WidgetDefTest", TestWidget);
  });

  after(() => {
    TestUtils.terminateUiFramework();
  });

  it("optional properties", () => {
    const widgetProps: WidgetProps = {
      defaultState: WidgetState.Open,
      priority: 100,
      isFreeform: true,
      iconSpec: "icon-home",
      label: "label",
      tooltip: "tooltip",
      isToolSettings: true,
      isStatusBar: true,
      fillZone: true,
      isFloatingStateSupported: true,
      isFloatingStateWindowResizable: false,
      applicationData: "AppData",
      element: <div />,
      syncEventIds: [SyncUiEventId.FrontstageReady],
      stateFunc: sinon.spy(),
      badgeType: BadgeType.TechnicalPreview,
    };
    const widgetDef: WidgetDef = new WidgetDef(widgetProps);

    expect(widgetDef.isVisible).to.eq(true);
    expect(widgetDef.isActive).to.eq(true);
    expect(widgetDef.isFloating).to.eq(false);
    expect(widgetDef.priority).to.eq(100);
    expect(widgetDef.isFreeform).to.eq(true);
    expect(widgetDef.isFloatingStateSupported).to.eq(true);
    expect(widgetDef.isFloatingStateWindowResizable).to.eq(false);
    expect(widgetDef.isToolSettings).to.eq(true);
    expect(widgetDef.isStatusBar).to.eq(true);
    expect(widgetDef.fillZone).to.eq(true);
    expect(widgetDef.applicationData).to.eq("AppData");

    expect(widgetDef.label).to.eq("label");
    expect(widgetDef.tooltip).to.eq("tooltip");
    expect(widgetDef.iconSpec).to.eq("icon-home");

    expect(widgetDef.badgeType).to.eq(BadgeType.TechnicalPreview);
  });

  it("registerControl & widgetControl using same classId", () => {
    const widgetProps: WidgetProps = {
      classId: "WidgetDefTest",
    };
    const widgetDef: WidgetDef = new WidgetDef(widgetProps);

    expect(widgetDef.getWidgetControl(ConfigurableUiControlType.Widget)).to.not.be.undefined;
    expect(widgetDef.reactNode).to.not.be.undefined;
  });

  it("labelKey and tooltipKey should return translated string", () => {
    const widgetProps: WidgetProps = {
      classId: "WidgetDefTest",
      labelKey: "App:label",
      tooltipKey: "App:tooltip",
    };
    const widgetDef: WidgetDef = new WidgetDef(widgetProps);

    expect(widgetDef.label).to.eq("label");
    expect(widgetDef.tooltip).to.eq("tooltip");
  });

  it("reactElement supports set and get", () => {
    const widgetProps: WidgetProps = {
      classId: "WidgetDefTest",
    };
    const widgetDef: WidgetDef = new WidgetDef(widgetProps);

    widgetDef.reactNode = <div />;
    expect(widgetDef.reactNode).to.not.be.undefined;
  });

  it("widgetControl using constructor classId", () => {
    const widgetProps: WidgetProps = {
      classId: TestWidget,
    };
    const widgetDef: WidgetDef = new WidgetDef(widgetProps);
    const widgetControl = widgetDef.getWidgetControl(ConfigurableUiControlType.Widget);

    expect(widgetControl).to.not.be.undefined;
    if (widgetControl)
      expect(widgetControl.classId).to.eq("TestWidget");
    expect(widgetDef.reactNode).to.not.be.undefined;
  });

  it("setWidgetState", () => {
    const widgetProps: WidgetProps = {
      classId: "WidgetDefTest",
      badgeType: BadgeType.None,
    };
    const widgetDef: WidgetDef = new WidgetDef(widgetProps);
    widgetDef.setWidgetState(WidgetState.Open);

    expect(widgetDef.stateChanged).to.eq(true);
    expect(widgetDef.isVisible).to.eq(true);
    expect(widgetDef.isActive).to.eq(true);
    expect(widgetDef.canOpen()).to.be.true;
  });

  it("setWidgetState using state function", () => {
    const testEventId = "test-widgetstate";
    const widgetProps: WidgetProps = {
      classId: "WidgetDefTest",
      syncEventIds: [testEventId],
      stateFunc: (): WidgetState => WidgetState.Hidden,
    };

    const widgetDef: WidgetDef = new WidgetDef(widgetProps);
    widgetDef.setWidgetState(WidgetState.Open);

    expect(widgetDef.isVisible).to.eq(true);
    expect(widgetDef.isActive).to.eq(true);
    expect(widgetDef.canOpen()).to.be.true;
    // firing sync event should trigger state function and set state to Hidden.
    SyncUiEventDispatcher.dispatchImmediateSyncUiEvent(testEventId);
    expect(widgetDef.isVisible).to.eq(false);
  });

  it("getWidgetControl throws an Error when type is incorrect", () => {
    const widgetProps: WidgetProps = {
      classId: "WidgetDefTest",
    };
    const widgetDef: WidgetDef = new WidgetDef(widgetProps);

    expect(() => widgetDef.getWidgetControl(ConfigurableUiControlType.StatusBarWidget)).to.throw(Error);
  });

});
