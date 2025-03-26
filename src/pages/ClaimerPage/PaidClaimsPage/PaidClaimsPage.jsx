import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import ClaimsTable from "../../../components/Table/ClaimsTable";
import { fetchClaimsRequestClaimer } from "../../../redux/actions/claimerActions";
import { filterPaidClaims } from "./utils";
import { PAGE_BREADCRUMB, ERROR_PREFIX, PAID_CLAIMS_TITLE } from "./strings";

const PaidClaims = () => {
  const dispatch = useDispatch();
  const { claims = [], loading, error } = useSelector((state) => state.claimer || {});

  useEffect(() => {
    dispatch(fetchClaimsRequestClaimer({}));
  }, [dispatch]);

  const paidClaims = filterPaidClaims(claims);

  return (
    <div className="p-0 bg-white">
      <div className="mb-4 text-gray-600">{PAGE_BREADCRUMB}</div>
      {error && <p className="text-red-500">{ERROR_PREFIX}{error}</p>}
      <ClaimsTable title={PAID_CLAIMS_TITLE} claimsData={paidClaims} filterCondition="Paid" />
    </div>
  );
};

export default PaidClaims;
