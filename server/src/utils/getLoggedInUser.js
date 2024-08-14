const getLoggedInUserId = function (req) {
  return req.cookies.sessionid;
};

module.exports = { getLoggedInUserId };
