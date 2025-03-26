import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import ClaimsTable from "../../../components/Table/ClaimsTable";
import { fetchClaimsRequest } from "../../../redux/actions/financeAction";
import { filterPaidClaims } from "./utils";
import { FINANCE_CONSTANTS } from "./constants";
import { STRINGS } from "./strings";

const FinancePaidPage = () => {
    const dispatch = useDispatch();
    const { claims = [], error } = useSelector((state) => state.finance || {});

    useEffect(() => {
        dispatch(fetchClaimsRequest({}));
    }, [dispatch]);

    const paidClaims = filterPaidClaims(claims);

    return (
        <div className="p-0 bg-white">
            {error && <p className="text-red-500">{STRINGS.ERROR_PREFIX}{error}</p>}
            <ClaimsTable
                title={STRINGS.PAID_CLAIMS_TITLE}
                claimsData={paidClaims}
                filterCondition={FINANCE_CONSTANTS.FILTER_CONDITION}
            />
        </div>
    );
};

export default FinancePaidPage;