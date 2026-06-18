"use client";

import React, { createContext, useContext } from "react";
import { Sheet, SheetStack, type SheetContentProps, type SheetOutletProps } from "@silk-hq/components";
import "./SheetWithDepth.css";

type SheetWithDepthContextValue = {
  contentPlacement: "bottom";
};

const SheetWithDepthContext = createContext<SheetWithDepthContextValue | null>(null);

const useSheetWithDepthContext = (componentName: string) => {
  const context = useContext(SheetWithDepthContext);
  if (!context) {
    throw new Error(`${componentName} must be used inside SheetWithDepth.Root.`);
  }
  return context;
};

const SheetWithDepthStackRoot = React.forwardRef<
  React.ElementRef<typeof SheetStack.Root>,
  React.ComponentPropsWithoutRef<typeof SheetStack.Root>
>(({ children, ...restProps }, ref) => {
  return (
    <SheetStack.Root {...restProps} ref={ref}>
      {children}
    </SheetStack.Root>
  );
});
SheetWithDepthStackRoot.displayName = "SheetWithDepthStack.Root";

type SheetRootProps = React.ComponentPropsWithoutRef<typeof Sheet.Root>;
type SheetWithDepthRootProps = Omit<SheetRootProps, "license"> & {
  license?: SheetRootProps["license"];
};

const SheetWithDepthRoot = React.forwardRef<
  React.ElementRef<typeof Sheet.Root>,
  SheetWithDepthRootProps
>(({ children, license = "non-commercial", ...restProps }, ref) => {
  return (
    <SheetWithDepthContext.Provider value={{ contentPlacement: "bottom" }}>
      <Sheet.Root license={license} forComponent="closest" {...restProps} ref={ref}>
        {children}
      </Sheet.Root>
    </SheetWithDepthContext.Provider>
  );
});
SheetWithDepthRoot.displayName = "SheetWithDepth.Root";

const SheetWithDepthOutlet = React.forwardRef<
  React.ElementRef<typeof Sheet.Outlet>,
  React.ComponentPropsWithoutRef<typeof Sheet.Outlet>
>(({ className, travelAnimation, stackingAnimation, ...restProps }, ref) => {
  const defaultTravelAnimation: SheetOutletProps["travelAnimation"] = {
    scale: [1, 0.94],
    translateY: ["0px", "-14px"],
    borderRadius: ({ progress }) => `${Math.min(progress, 1) * 28}px`,
    overflow: ({ progress }) => (progress > 0.01 ? "clip" : "visible"),
    ...travelAnimation,
  };

  const defaultStackingAnimation: SheetOutletProps["stackingAnimation"] = {
    scale: [1, 0.96],
    translateY: ["0px", "-10px"],
    opacity: [1, 0.92],
    ...stackingAnimation,
  };

  return (
    <Sheet.Outlet
      className={`SheetWithDepth-outlet ${className ?? ""}`}
      travelAnimation={defaultTravelAnimation}
      stackingAnimation={defaultStackingAnimation}
      {...restProps}
      ref={ref}
    />
  );
});
SheetWithDepthOutlet.displayName = "SheetWithDepth.Outlet";

const SheetWithDepthView = React.forwardRef<
  React.ElementRef<typeof Sheet.View>,
  React.ComponentPropsWithoutRef<typeof Sheet.View>
>(({ children, className, ...restProps }, ref) => {
  const { contentPlacement } = useSheetWithDepthContext("SheetWithDepth.View");

  return (
    <Sheet.View
      className={`SheetWithDepth-view contentPlacement-${contentPlacement} ${className ?? ""}`}
      contentPlacement={contentPlacement}
      nativeEdgeSwipePrevention
      {...restProps}
      ref={ref}
    >
      {children}
    </Sheet.View>
  );
});
SheetWithDepthView.displayName = "SheetWithDepth.View";

const SheetWithDepthBackdrop = React.forwardRef<
  React.ElementRef<typeof Sheet.Backdrop>,
  React.ComponentPropsWithoutRef<typeof Sheet.Backdrop>
>(({ className, travelAnimation, ...restProps }, ref) => {
  return (
    <Sheet.Backdrop
      className={`SheetWithDepth-backdrop ${className ?? ""}`}
      travelAnimation={{ opacity: [0, 0.34], ...travelAnimation }}
      themeColorDimming="auto"
      {...restProps}
      ref={ref}
    />
  );
});
SheetWithDepthBackdrop.displayName = "SheetWithDepth.Backdrop";

const SheetWithDepthContent = React.forwardRef<
  React.ElementRef<typeof Sheet.Content>,
  React.ComponentPropsWithoutRef<typeof Sheet.Content>
>(({ children, className, stackingAnimation, ...restProps }, ref) => {
  const { contentPlacement } = useSheetWithDepthContext("SheetWithDepth.Content");

  const defaultStackingAnimation: SheetContentProps["stackingAnimation"] = {
    translateY: ({ progress }) =>
      progress <= 1 ? `${progress * -18}px` : `calc(-22px + ${progress * 4}px)`,
    scale: [1, 0.94],
    transformOrigin: "50% 0",
    filter: ({ progress }) => `brightness(${1 - Math.min(progress, 1) * 0.08})`,
    ...stackingAnimation,
  };

  return (
    <Sheet.Content
      className={`SheetWithDepth-content contentPlacement-${contentPlacement} ${className ?? ""}`}
      stackingAnimation={defaultStackingAnimation}
      {...restProps}
      ref={ref}
    >
      <div className="SheetWithDepth-innerContent">{children}</div>
    </Sheet.Content>
  );
});
SheetWithDepthContent.displayName = "SheetWithDepth.Content";

const SheetWithDepthHandle = React.forwardRef<
  React.ElementRef<typeof Sheet.Handle>,
  React.ComponentPropsWithoutRef<typeof Sheet.Handle>
>(({ className, ...restProps }, ref) => {
  return <Sheet.Handle className={`SheetWithDepth-handle ${className ?? ""}`} {...restProps} ref={ref} />;
});
SheetWithDepthHandle.displayName = "SheetWithDepth.Handle";

export const SheetWithDepthStack = {
  Root: SheetWithDepthStackRoot,
};

export const SheetWithDepth = {
  Root: SheetWithDepthRoot,
  Trigger: Sheet.Trigger,
  Portal: Sheet.Portal,
  View: SheetWithDepthView,
  Backdrop: SheetWithDepthBackdrop,
  Content: SheetWithDepthContent,
  Handle: SheetWithDepthHandle,
  Outlet: SheetWithDepthOutlet,
  Title: Sheet.Title,
  Description: Sheet.Description,
};
