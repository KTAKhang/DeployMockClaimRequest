import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import ClaimsTable from "../../../components/Table/ClaimsTable";
import { fetchClaimsRequestClaimer } from "../../../redux/actions/claimerActions";
import { filterDraftClaims } from "./utils";
import { ERROR_PREFIX, DRAFT_CLAIMS_TITLE } from "./strings";

const DraftClaims = () => {
  const dispatch = useDispatch();
  const {
    claims = [],
    loading,
    error,
  } = useSelector((state) => state.claimer || {});

  useEffect(() => {
    dispatch(fetchClaimsRequestClaimer({}));
  }, [dispatch]);

  const draftClaims = filterDraftClaims(claims);

  return (
    <div className="p-0 bg-white">
      {error && (
        <p className="text-red-500">
          {ERROR_PREFIX}
          {error}
        </p>
      )}
      <ClaimsTable
        title={DRAFT_CLAIMS_TITLE}
        claimsData={draftClaims}
        filterCondition="Draft"
      />
    </div>
  );
};

export default DraftClaims;
