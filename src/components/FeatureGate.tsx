import { TGatedFeature } from "@src/constants/featureAccess";
import { useFeatureAccess } from "@src/hooks/useFeatureAccess";
import { observer } from "mobx-react-lite";
import React from "react";
import { Navigate } from "react-router-dom";

interface IProps {
  feature: TGatedFeature;
  /** Where to send accounts that are not on the whitelist. */
  redirectTo: string;
  children: React.ReactNode;
}

const FeatureGate: React.FC<IProps> = ({ feature, redirectTo, children }) => {
  const allowed = useFeatureAccess(feature);
  if (!allowed) return <Navigate to={redirectTo} replace />;
  return <>{children}</>;
};

export default observer(FeatureGate);
