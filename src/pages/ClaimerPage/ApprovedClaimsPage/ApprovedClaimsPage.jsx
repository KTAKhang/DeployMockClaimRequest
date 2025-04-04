import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import ClaimsTable from "../../../components/Table/ClaimsTable";
import { fetchClaimsRequestClaimer } from "../../../redux/actions/claimerActions";
import { filterApprovedClaims } from "./utils";
import { STRINGS } from "./strings";

const ApprovedClaims = () => {
  const dispatch = useDispatch();
  const {
    claims = [],
    loading,
    error,
  } = useSelector((state) => state.claimer || {});

  useEffect(() => {
    dispatch(fetchClaimsRequestClaimer({}));
  }, [dispatch]);

  const approvedClaims = filterApprovedClaims(claims);

  return (
    <div className="p-0 bg-white">
      {error && (
        <p className="text-red-500">
          {STRINGS.ERROR_PREFIX} {error}
        </p>
      )}
      <ClaimsTable
        title={STRINGS.TABLE_TITLE}
        claimsData={approvedClaims}
        filterCondition="Approved"
        hideCheckboxes={true}
      />
    </div>
  );
};

export default ApprovedClaims;
