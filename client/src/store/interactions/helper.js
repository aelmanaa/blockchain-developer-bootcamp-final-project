import { uiActions } from "../state/ui";

export const transact = async (
  dispatch,
  func,
  args,
  options,
  actionName = ""
) => {
  dispatch(
    uiActions.showNotification({
      status: "pending",
      title: "Sending...",
      message: `Starting ${actionName} transaction!`,
    })
  );
  try {
    let res = await func(...args).send(options);
    console.log(res);
    dispatch(
      uiActions.showNotification({
        status: "success",
        title: "Success!",
        message: `${actionName} transaction successfull!`,
      })
    );
    return res;
  } catch (error) {
    console.error(error);
    dispatch(
      uiActions.showNotification({
        status: "error",
        title: "Error!",
        message: `${actionName} transaction failed!`,
      })
    );
    return null;
  }
};
