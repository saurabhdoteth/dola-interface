import dayjs from "dayjs";

export const DateDivider = ({ date }: { date: Date }): JSX.Element => {
  return (
    <div className="flex align-items-center items-center pb-8 pt-4">
      <div className="grow h-0.5 bg-gray-300/25" />
      <span className="mx-2 flex-none text-gray-500 text-xs font-bold">
        {dayjs(date).format("MMMM DD, YYYY")}
      </span>
      <div className="grow h-0.5 bg-gray-300/25" />
    </div>
  );
};
