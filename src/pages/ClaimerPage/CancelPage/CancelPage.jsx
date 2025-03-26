import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchClaimsRequestClaimer } from "../../../redux/actions/claimerActions";
import ClaimsTable from "../../../components/Table/ClaimsTable";
import { filterCancelledClaims } from "./utils";
import { PAGE_BREADCRUMB, ERROR_PREFIX, CANCEL_CLAIMS_TITLE } from "./strings";

const CancelClaims = () => {
    const dispatch = useDispatch();
    const { claims = [], loading, error } = useSelector((state) => state.claimer || {});

    useEffect(() => {
        dispatch(fetchClaimsRequestClaimer({}));
    }, [dispatch]);

    const approvedClaims = filterCancelledClaims(claims);

    return (
        <div className="p-0 bg-white">
            <div className="mb-4 text-gray-600">{PAGE_BREADCRUMB}</div>
            {error && <p className="text-red-500">{ERROR_PREFIX}{error}</p>}
            <ClaimsTable title={CANCEL_CLAIMS_TITLE} claimsData={approvedClaims} filterCondition="Cancelled" />
        </div>
    );
};

export default CancelClaims;
