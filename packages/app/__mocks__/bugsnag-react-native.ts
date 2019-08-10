const Client = jest.fn().mockImplementation(() => ({
  setUser: jest.fn(),
  notify: jest.fn(),
}));

const Configuration = jest.fn().mockImplementation(() => ({
  codeBundleId: '',
  notifyReleaseStages: [],
  registerBeforeSendCallback: jest.fn(),
}));

export { Client, Configuration };
