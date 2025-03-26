import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import ClaimsTable from "../../../components/Table/ClaimsTable";
import { fetchClaimsRequestClaimer } from "../../../redux/actions/claimerActions";
import { filterRejectedClaims } from "./utils";
import { PAGE_BREADCRUMB, ERROR_PREFIX, REJECTED_CLAIMS_TITLE } from "./strings";

const RejectedClaims = () => {
  const dispatch = useDispatch();
  const { claims = [], loading, error } = useSelector((state) => state.claimer || {});

  useEffect(() => {
    dispatch(fetchClaimsRequestClaimer({}));
  }, [dispatch]);

  const rejectedClaims = filterRejectedClaims(claims);

  return (
    <div className="p-0 bg-white">
      <div className="mb-4 text-gray-600">{PAGE_BREADCRUMB}</div>
      {error && <p className="text-red-500">{ERROR_PREFIX}{error}</p>}
      <ClaimsTable title={REJECTED_CLAIMS_TITLE} claimsData={rejectedClaims} filterCondition="Rejected" />
    </div>
  );
};

export default RejectedClaims;
