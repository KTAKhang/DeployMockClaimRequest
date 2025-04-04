import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import ClaimsTable from "../../../components/Table/ClaimsTable";
import { fetchClaimsRequestClaimer } from "../../../redux/actions/claimerActions";
import { filterRejectedClaims } from "./utils";
import { ERROR_PREFIX, REJECTED_CLAIMS_TITLE } from "./strings";

const RejectedClaims = () => {
  const dispatch = useDispatch();
  const {
    claims = [],
    loading,
    error,
  } = useSelector((state) => state.claimer || {});

  useEffect(() => {
    dispatch(fetchClaimsRequestClaimer({}));
  }, [dispatch]);

  const rejectedClaims = filterRejectedClaims(claims);

  return (
    <div className="p-0 bg-white">
      {error && (
        <p className="text-red-500">
          {ERROR_PREFIX}
          {error}
        </p>
      )}
      <ClaimsTable
        title={REJECTED_CLAIMS_TITLE}
        claimsData={rejectedClaims}
        filterCondition="Rejected"
        hideCheckboxes={true}
      />
    </div>
  );
};

export default RejectedClaims;
