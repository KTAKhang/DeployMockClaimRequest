import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import ClaimsTable from "../../../components/Table/ClaimsTable";
import { fetchClaimsRequestClaimer } from "../../../redux/actions/claimerActions";
import { filterPaidClaims } from "./utils";
import { ERROR_PREFIX, PAID_CLAIMS_TITLE } from "./strings";

const PaidClaims = () => {
  const dispatch = useDispatch();
  const {
    claims = [],
    loading,
    error,
  } = useSelector((state) => state.claimer || {});

  useEffect(() => {
    dispatch(fetchClaimsRequestClaimer({}));
  }, [dispatch]);

  const paidClaims = filterPaidClaims(claims);

  return (
    <div className="p-0 bg-white">
      {error && (
        <p className="text-red-500">
          {ERROR_PREFIX}
          {error}
        </p>
      )}
      <ClaimsTable
        title={PAID_CLAIMS_TITLE}
        claimsData={paidClaims}
        filterCondition="Paid"
        hideCheckboxes={true}
      />
    </div>
  );
};

export default PaidClaims;
