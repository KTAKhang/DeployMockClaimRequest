// ClaimsHistory.js
import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchClaimsRequest } from "../../../redux/actions/approverClaimActions";
import ClaimsTable from "../../../components/Table/ClaimsTable";

import { FILTER_CONDITIONS } from "./constants";
import { TABLE_TITLES } from "./strings";
import { filterApprovedAndPaidClaims, hasClaimsChanged } from "./utils";

export default function ClaimsHistory() {
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

  const filteredClaims = filterApprovedAndPaidClaims(claims);

  return (
    <ClaimsTable
      title={TABLE_TITLES.PAID_OR_APPROVED_CLAIMS}
      claimsData={filteredClaims}
      filterCondition={FILTER_CONDITIONS.CLAIMS_HISTORY}
      loading={loading}
      hideUpdatedAt={true}
      hideCheckboxes={true}
    />
  );
}
