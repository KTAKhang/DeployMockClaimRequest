// ForMyVetting.js
import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchClaimsRequest } from "../../../redux/actions/approverClaimActions";
import ClaimsTable from "../../../components/Table/ClaimsTable";

import { FILTER_CONDITIONS } from "./constants";
import { TABLE_TITLES } from "./strings";
import { filterPendingClaims, hasClaimsChanged } from "./utils";

export default function ForMyVetting() {
  const dispatch = useDispatch();
  const { claims, loading, lastUpdated } = useSelector((state) => state.claims);
  const previousClaims = useRef(claims);

  useEffect(() => {
    dispatch(fetchClaimsRequest());
  }, [dispatch]);

  useEffect(() => {
    if (lastUpdated && hasClaimsChanged(previousClaims.current, claims)) {
      dispatch(fetchClaimsRequest());
      previousClaims.current = claims;
    }
  }, [dispatch, lastUpdated, claims]);

  const pendingClaims = filterPendingClaims(claims);

  return (
    <ClaimsTable
      title={TABLE_TITLES.CLAIMS_FOR_APPROVAL}
      claimsData={pendingClaims}
      filterCondition={FILTER_CONDITIONS.FOR_MY_VETTING}
      loading={loading}
      hideUpdatedAt={true}
    />
  );
}
