// FinanceApprovedPage.jsx
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import ClaimsTable from "../../../components/Table/ClaimsTable";
import { fetchClaimsRequest } from "../../../redux/actions/financeAction";
import { filterApprovedClaims } from "./utils";
import strings from "./strings";
import { FILTER_CONDITIONS } from "./constants";

const FinanceApprovedPage = () => {
    const dispatch = useDispatch();
    const { claims = [], loading, error } = useSelector((state) => state.finance || {});

    useEffect(() => {
        dispatch(fetchClaimsRequest({}));
    }, [dispatch]);

    // Filter approved claims using utility function
    const approvedClaims = filterApprovedClaims(claims);

    return (
        <div className="p-0 bg-white">
            {error && <p className="text-red-500">{strings.CLAIMS_TABLE.ERROR_PREFIX}{error}</p>}

            <ClaimsTable
                title={strings.CLAIMS_TABLE.APPROVED_TITLE}
                claimsData={approvedClaims}
                filterCondition={FILTER_CONDITIONS.FINANCE_APPROVED}
            />
        </div>
    );
};

export default FinanceApprovedPage;