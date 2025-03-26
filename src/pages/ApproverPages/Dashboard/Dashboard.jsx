// Dashboard.jsx
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaClipboardCheck, FaClock, FaMoneyCheckAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchClaimsRequest } from "../../../redux/actions/approverClaimActions.js";
import Loading from "../../../components/Loading/Loading.jsx";
import TypewriterText from "../../../components/Typewriter/TypewriterText.jsx";
import { ClaimCard } from "./ClaimCard";

import { CLAIM_STATUSES, ROUTES } from "./constants";
import { DASHBOARD_TEXTS, DASHBOARD_STATS } from "./strings";
import {
  filterClaimsByStatus,
  prepareClaimDisplay,
  hasClaimsChanged,
} from "./utils";

export default function Dashboard() {
  const [showAll, setShowAll] = useState(false);
  const dispatch = useDispatch();
  const { claims, loading, error, lastUpdated } = useSelector(
    (state) => state.claims
  );
  const previousClaims = useRef(claims);

  const navigate = useNavigate();

  useEffect(() => {
    dispatch(fetchClaimsRequest());
  }, [dispatch]);

  useEffect(() => {
    if (lastUpdated && hasClaimsChanged(previousClaims.current, claims)) {
      dispatch(fetchClaimsRequest());
      previousClaims.current = claims;
    }
  }, [dispatch, lastUpdated, claims]);

  // Filter Claims
  const pendingClaims = filterClaimsByStatus(claims, CLAIM_STATUSES.PENDING);
  const approvedClaims = filterClaimsByStatus(claims, CLAIM_STATUSES.APPROVED);
  const paidClaims = filterClaimsByStatus(claims, CLAIM_STATUSES.PAID);

  // Prepare claims for display
  const { firstFiveClaims, extraClaims, hasExtraClaims } =
    prepareClaimDisplay(pendingClaims);

  // Navigation handlers
  const navigateToVetting = () => navigate(ROUTES.VETTING);
  const navigateToApprovedHistory = () =>
    navigate(`${ROUTES.HISTORY}?status=${CLAIM_STATUSES.APPROVED}`);
  const navigateToPaidHistory = () =>
    navigate(`${ROUTES.HISTORY}?status=${CLAIM_STATUSES.PAID}`);

  return (
    <div className="p-3 sm:p-6 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-xl sm:text-2xl md:text-3xl text-center font-bold text-gray-800 mb-4 sm:mb-8"
      >
        <TypewriterText text={DASHBOARD_TEXTS.WELCOME_MESSAGE} />
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-red-100 border border-red-400 text-red-700 px-2 sm:px-4 py-2 sm:py-3 rounded mb-4 sm:mb-6"
          role="alert"
        >
          <p className="text-sm sm:text-base text-center">{error}</p>
        </motion.div>
      )}

      {loading ? (
        <div className="mt-6 sm:mt-10">
          <Loading message={DASHBOARD_TEXTS.LOADING_MESSAGE} />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 mb-4 sm:mb-8">
            {[
              {
                ...DASHBOARD_STATS[0],
                value: pendingClaims.length,
                onClick: navigateToVetting,
              },
              {
                ...DASHBOARD_STATS[1],
                value: approvedClaims.length,
                onClick: navigateToApprovedHistory,
              },
              {
                ...DASHBOARD_STATS[2],
                value: paidClaims.length,
                onClick: navigateToPaidHistory,
              },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -3, scale: 1.01 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={`bg-gradient-to-br ${stat.color.gradient} p-3 sm:p-6 shadow-lg rounded-xl flex items-center space-x-2 sm:space-x-4 border ${stat.color.hoverGradient} transition-all cursor-pointer`}
                onClick={stat.onClick}
              >
                <div className="bg-white p-2 sm:p-3 rounded-lg shadow-sm">
                  {stat.icon === "FaClock" && (
                    <FaClock
                      className={`text-2xl sm:text-4xl ${stat.color.icon}`}
                    />
                  )}
                  {stat.icon === "FaClipboardCheck" && (
                    <FaClipboardCheck
                      className={`text-2xl sm:text-4xl ${stat.color.icon}`}
                    />
                  )}
                  {stat.icon === "FaMoneyCheckAlt" && (
                    <FaMoneyCheckAlt
                      className={`text-2xl sm:text-4xl ${stat.color.icon}`}
                    />
                  )}
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 font-medium">
                    {stat.label}
                  </p>
                  <p
                    className={`text-lg sm:text-2xl font-bold ${stat.color.text}`}
                  >
                    {stat.value}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-4 sm:mt-8 bg-white p-4 sm:p-6 shadow-lg rounded-xl border"
          >
            <div className="flex justify-between items-center mb-3 sm:mb-4">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800">
                Pending Approvals
              </h3>
              {pendingClaims.length > 0 && (
                <span className="bg-yellow-100 text-yellow-800 text-xs sm:text-sm font-medium px-2 sm:px-3 py-1 rounded-full">
                  {pendingClaims.length} pending
                </span>
              )}
            </div>

            {pendingClaims.length === 0 ? (
              <div className="py-8 sm:py-12 flex flex-col items-center justify-center text-gray-500">
                <FaClipboardCheck className="text-2xl sm:text-4xl text-gray-300 mb-2 sm:mb-3" />
                <p className="text-sm sm:text-base text-center">
                  {DASHBOARD_TEXTS.NO_PENDING_CLAIMS}
                </p>
                <p className="text-xs sm:text-sm text-gray-400">
                  {DASHBOARD_TEXTS.ALL_CAUGHT_UP}
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-2 sm:space-y-3">
                  {firstFiveClaims.map((claim, index) => (
                    <ClaimCard
                      key={claim._id || claim.id || `claim-${index}`}
                      claim={claim}
                      navigate={navigate}
                    />
                  ))}
                </div>

                <AnimatePresence>
                  {showAll && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="space-y-2 sm:space-y-3 mt-2 sm:mt-3"
                    >
                      {extraClaims.map((claim, index) => (
                        <ClaimCard
                          key={claim._id || claim.id || `extra-claim-${index}`}
                          claim={claim}
                          navigate={navigate}
                        />
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                {hasExtraClaims && (
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setShowAll(!showAll)}
                    className="mt-4 sm:mt-6 w-full py-2 sm:py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg transition-all hover:from-blue-600 hover:to-blue-700 shadow hover:shadow-md flex items-center justify-center gap-2 text-sm sm:text-base"
                  >
                    {showAll
                      ? DASHBOARD_TEXTS.SHOW_LESS
                      : DASHBOARD_TEXTS.SHOW_MORE}
                    <motion.span
                      animate={{ rotate: showAll ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      ▼
                    </motion.span>
                  </motion.button>
                )}
              </>
            )}
          </motion.div>
        </>
      )}
    </div>
  );
}
