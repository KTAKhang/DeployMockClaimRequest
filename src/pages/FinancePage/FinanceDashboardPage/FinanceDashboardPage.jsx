// FinanceDashboardPage.jsx
import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { AiOutlineAppstore } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import logo from "../../../../public/logo.svg";
import { fetchClaimsRequest } from "../../../redux/actions/financeAction";
import Loading from "../../../components/Loading/Loading";

import { DASHBOARD_TITLE, LOADING_MESSAGE } from "./strings";
import { CARD_COLORS, CARD_VARIANTS } from "./constants";
import { processClaimData, createCardData } from "./utils";

function FinanceDashboardPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(fetchClaimsRequest({}));
    document.title = DASHBOARD_TITLE;
  }, [dispatch]);

  const { claims, loading } = useSelector((state) => state.finance);

  if (loading) {
    return (
      <div className="mt-24">
        <Loading message={LOADING_MESSAGE} />
      </div>
    );
  }

  const claimData = processClaimData(claims);
  const cards = createCardData(claimData, CARD_COLORS, {
    TOTAL: "",
    APPROVED: "/finance/approved",
    PAID: "/finance/paid"
  });

  return (
    <div>
      <div className="text-[#707EAE] m-3">{DASHBOARD_TITLE}</div>
      <div className="p-4 bg-[#FFFFFF] h-[630px] flex flex-col w-full">
        <div className="flex flex-wrap lg:flex-nowrap w-full">
          {cards.map((card, index) => (
            <motion.div
              key={index}
              variants={CARD_VARIANTS}
              initial="hidden"
              animate="visible"
              custom={index}
              className="p-4 m-4 rounded-tl-[10px] rounded-br-[10px] w-full sm:w-[352px] h-[189px] text-[#FFFFFF] flex flex-1 flex-col justify-between shrink-0 cursor-pointer"
              style={{ backgroundColor: card.color }}
              onClick={() => card.link && navigate(card.link)}
            >
              <div className="text-white text-center text-[30px] font-black tracking-[-0.18px]">
                {card.label}
              </div>
              <div className="flex items-center justify-between">
                <AiOutlineAppstore className="w-[70px] h-[70px]" />
                <div className="text-white text-[40px] w-[200px] h-[70px] font-black tracking-[-0.18px]">
                  {card.value}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ duration: 1 }}
          className="hidden md:flex flex-1 justify-center w-full"
        >
          <img className="bg-[#FFFFFF] " src={logo} alt="Logo" />
        </motion.div>
      </div>
    </div>
  );
}

export default FinanceDashboardPage;