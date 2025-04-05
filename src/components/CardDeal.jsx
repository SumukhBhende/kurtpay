import { card } from "../assets";
import styles, { layout } from "../style";
import Button from "./Button";

const CardDeal = ({ onAuthClick }) => (
  <section className={layout.section}>
    <div className={layout.sectionInfo}>
      <h2 className={styles.heading2}>
        Register yourself <br className="sm:block hidden" /> in few easy
        steps.
      </h2>
      <p className={`${styles.paragraph} max-w-[470px] mt-5`}>
        Once you register, you can pay your bills online and get a generated receipt for your paid bills.
        You can also track your bills and manage your bills online.
      </p>

      <Button styles={`mt-10`} onClick={() => onAuthClick('register')} />
    </div>

    <div className={layout.sectionImg}>
      <img src={card} alt="billing" className="w-[100%] h-[100%]" />
    </div>
  </section>
);

export default CardDeal;
