import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchClaimsRequest } from "../../../../redux/actions/approverClaimActions";
import ClaimsTable from "../../../../components/Table/ClaimsTable";
import { useNavigate } from "react-router-dom";
import { FILTER_CONDITIONS } from "../../../../components/Table/constants";

export default function ClaimManagerment() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { claims, loading, lastUpdated } = useSelector((state) => state.claims);
  const previousClaims = useRef(claims);

  useEffect(() => {
    dispatch(fetchClaimsRequest());
  }, [dispatch]);

  useEffect(() => {
    if (
      lastUpdated &&
      JSON.stringify(previousClaims.current) !== JSON.stringify(claims)
    ) {
      dispatch(fetchClaimsRequest());
      previousClaims.current = claims;
    }
  }, [dispatch, lastUpdated, claims]);

  // Hiển thị tất cả các claims, không cần filter
  const filteredClaims = claims;

  // Hàm xử lý khi click vào claim để xem chi tiết
  const handleViewClaimDetail = (claimId) => {
    navigate(`/admin/claim-management/${claimId}`);
  };

  return (
    <ClaimsTable
      title="Claim Management"
      claimsData={filteredClaims}
      filterCondition={FILTER_CONDITIONS.CLAIM_MANAGEMENT}
      loading={loading}
      hideUpdatedAt={true}
      onViewDetail={handleViewClaimDetail}
      hideActionButtons={true}
      hideCheckboxes={true}
    />
  );
}
