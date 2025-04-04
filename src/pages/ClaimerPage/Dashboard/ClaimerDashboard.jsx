import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchClaimsRequestClaimer } from "../../../redux/actions/claimerActions";
import ClaimsTable from "../../../components/Table/ClaimsTable";
import { useNavigate } from "react-router-dom";
import { STATUS } from "../ClaimDetail/constants";

export default function ClaimerDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { claims, loading, lastUpdated } = useSelector((state) => state.claimer);
  const previousClaims = useRef(claims);

  useEffect(() => {
    // Fetch tất cả claim của người dùng hiện tại mà không cần filter trạng thái
    dispatch(fetchClaimsRequestClaimer({}));
  }, [dispatch]);

  useEffect(() => {
    if (
      lastUpdated &&
      JSON.stringify(previousClaims.current) !== JSON.stringify(claims)
    ) {
      dispatch(fetchClaimsRequestClaimer({}));
      previousClaims.current = claims;
    }
  }, [dispatch, lastUpdated, claims]);

  // Hàm xử lý khi click vào claim để xem chi tiết
  const handleViewClaimDetail = (claimId) => {
    
    const claim = claims.find(claim => claim.id === claimId);

    
    if (claim) {
      const status = claim.status.toLowerCase();
      console.log("Claim status:", status);
      navigate(`/claimer/${status}/${claimId}`);
    } else {
      navigate("/claimer");
    }
  };

  return (
    <ClaimsTable
      title="Your Claims Dashboard"
      claimsData={claims}
      filterCondition="ClaimerDashboard"
      loading={loading}
      hideUpdatedAt={true}
      onViewDetail={handleViewClaimDetail}
      hideActionButtons={true}
      hideCheckboxes={true}
    />
  );
} 