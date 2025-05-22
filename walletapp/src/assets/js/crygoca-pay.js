(function (factory) {
    typeof define === 'function' && define.amd ? define(factory) :
    factory();
  })((function () { 'use strict';
  
    var __assign = (undefined && undefined.__assign) || function () {
        __assign = Object.assign || function(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                    t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };
    var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    var __generator = (undefined && undefined.__generator) || function (thisArg, body) {
        var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
        return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f) throw new TypeError("Generator is already executing.");
            while (g && (g = 0, op[0] && (_ = 0)), _) try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
                if (y = 0, t) op = [op[0] & 2, t.value];
                switch (op[0]) {
                    case 0: case 1: t = op; break;
                    case 4: _.label++; return { value: op[1], done: false };
                    case 5: _.label++; y = op[1]; op = [0]; continue;
                    case 7: op = _.ops.pop(); _.trys.pop(); continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                        if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                        if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                        if (t[2]) _.ops.pop();
                        _.trys.pop(); continue;
                }
                op = body.call(thisArg, _);
            } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
            if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
        }
    };
    var _window = window;
    var CrygocaPayModal = /** @class */ (function () {
        function CrygocaPayModal(config) {
            this.config = {};
            this.user = null;
            this.frontendBaseUrl = "https://uatmarketplace.crygoca.com";
            // serverUrl:string = "https://be.crygoca.co.uk";
            this.serverUrl = "http://localhost:8000";
            this.tokenKey = "javapp-accessToken";
            this.config = config;
            this.modal = null;
            this.isLoading = false;
            this.authPinSent = false;
            this.showProcessingPaymentSpinner = false;
            this.showSendingAuthorizationSpinner = false;
            this.paymentHash = "";
            this.otpText = "Resend Authorization Pin";
            this.timeLeft = 30;
            this.payment = {
                amount: config.amount || 0,
                authorizationPin: "",
                orderId: config.orderId || "",
                paymentHash: "",
            };
            this.wallet = {
                currency: "USD",
                currencySymbol: "$",
                balance: 0.0,
                walletAccountNo: "",
            };
            this.user = null;
            this.amountToPay = 0.0;
        }
        CrygocaPayModal.prototype.openModal = function () {
            if (!this.modal) {
                this.createModal();
            }
            if (this.modal) {
                this.modal.style.display = "block";
                document.body.style.overflow = "hidden";
            }
        };
        CrygocaPayModal.prototype.closeModal = function () {
            if (this.modal) {
                this.modal.style.display = "none";
                document.body.style.overflow = "auto";
                if (this.config.onClose)
                    this.config.onClose();
                this.destroyModal();
            }
        };
        CrygocaPayModal.prototype.createModal = function () {
            var _this = this;
            var _a, _b, _c, _d, _e, _f, _g, _h, _j;
            this.modal = document.createElement("div");
            this.modal.id = "crygoca-pay-modal";
            this.modal.innerHTML =
                "\n    <style>\n    /* Modal Overlay */\n    .modal-overlay {\n      position: fixed;\n      top: 0;\n      left: 0;\n      width: 100%;\n      height: 100%;\n      background: rgba(0, 0, 0, 0.5); /* Semi-transparent black */\n      backdrop-filter: blur(4px); /* Blur effect */\n      z-index: 9999;\n      display: flex;\n      justify-content: center;\n      align-items: center;\n    }\n\n    /* Modal Content */\n    .modal-content {\n      background: white;\n      padding: 30px;\n      width: 400px;\n      max-width: 90%;\n      height: auto;\n      max-height: 90vh;\n      border-radius: 10px;\n      box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);\n      position: relative;\n      text-align: center;\n      transition: width 0.7s ease-in-out, height 0.7s ease-in-out;\n    }\n\n\n    /* Close Button */\n\n    .close-btn-bg {\n      position: absolute;\n      top: 15px;\n      right: 15px;\n    }\n\n    .close-btn {\n      font-size: 24px;\n      background: transparent;\n      border: none;\n      cursor: pointer;\n      color: black !important;\n    }\n\n    .pay-btn {\n      background-color: orange;\n      color: white;\n      padding: 10px 20px;\n      font-size: 16px;\n      border: none;\n      cursor: pointer;\n      transition: opacity 0.3sease;\n      width: 100%;\n      border-radius: 5px;\n    }\n\n    .pay-btn:hover {\n      background-color: black;\n      color: white;\n    }\n\n    .otp-link-text {\n      text-align: center;\n      margin-top: 20px;\n      display: none;\n    }\n\n    .pay-btn.disabled-btn {\n      opacity: 0.6;\n      cursor: not-allowed;\n    }\n\n    .debit-message {\n      margin-bottom: 20px;\n    }\n\n    .wallet-id{\n      margin-top: 20px;\n      margin-bottom: 40px;\n      text-align: center;\n      font-size: 30px;\n      font-weight: 600;\n    }\n\n    .authorization-pin {\n      margin-bottom: 40px;\n      text-align: center;\n      font-size: 30px;\n      font-weight: 600;\n    }\n\n    .authorization-pin {\n      -moz-appearance: textfield; /* Firefox */\n    }\n\n    .authorization-pin::-webkit-outer-spin-button,\n    .authorization-pin::-webkit-inner-spin-button {\n      -webkit-appearance: none; /* Chrome, Safari, Edge, Opera */\n      margin: 0;\n    }\n\n    .btn-bg {\n      width: 50px;\n      height: 50px;\n      border-radius: 50%;\n      background: white;\n      display: flex;\n      align-items: center;\n      justify-content: center;\n    }\n\n    h2{\n      color: black;\n    }\n\n    input{\n      width: 100%;\n    }\n\n\n    .fa-wallet{\n        width: 35px;\n    }\n\n    #authPin{\n     display: none;\n    }\n\n    #loaded-wallet{\n      display: none;\n    }\n\n    #showSendingAuthorizationSpinner{\n      display: none;\n    }\n\n    #showLoadingWalletSpinner{\n      display: none;\n    }\n\n    #showPayNowSpinner{\n      display: none;\n    }\n\n    .see-more-cont{\n    margin-bottom: 20px;\n    }\n\n    .more-details{\n      color: orange;\n      display:none;\n      \n    }\n\n    #details-content{\n      display: flex;\n      flex-direction: column;\n      align-items: flex-start;\n      justify-content: center;\n      padding-left: 22%;\n    }\n\n    .flex-row-center{\n      display: flex;\n      justify-content: center;\n      align-items: center;\n      gap: 20px;\n    }\n\n    .business-name{\n      font-size: 18px;\n      font-weight: 700;\n    }\n\n    .white-nano-spinner {\n      width: 13px; /* Adjust spinner size */\n      height: 13px;\n      border: 2px solid white;\n      border-top: 2px solid transparent; /* Placeholder color for the spinner, replace with spinner animation */\n      border-radius: 50%; /* Make it circular */\n      animation: spin 1s linear infinite; /* Add spin animation if you want a spinning effect */\n    }\n\n    @keyframes spin {\n      from {\n        transform: rotate(0deg);\n      }\n      to {\n        transform: rotate(360deg);\n      }\n    }\n\n    </style>\n    <div class=\"modal-overlay\">\n         <div class=\"close-btn-bg btn-bg\">\n            <button class=\"close-btn\" id=\"closeModalBtn\">\u2716</button>\n        </div>\n        <div class=\"modal-content\">\n            <div id=\"load-wallet\">\n                <div style=\"gap: 20px;font-size: 20px;\" class=\"flex-row-center\">\n                  <img src=\"" + ((_a = this.config) === null || _a === void 0 ? void 0 : _a.logo) + "\" alt=\"\" style=\"width: 40px; border-radius: 50%;\">\n                  <div class=\"business-name\">" + ((_b = this.config) === null || _b === void 0 ? void 0 : _b.businessName) + "</div>\n                </div>\n                <div style=\"margin-bottom:10px; text-align:center\">Securely Pay With Crygoca Wallet \uD83D\uDE80</div>\n                <input id=\"walletId\" placeholder=\"Enter your wallet ID\" type=\"text\" class=\"wallet-id\"/>\n                <button id=\"getWalletInfoBtn\" class=\"pay-btn flex-row-center\">\n                    <div id=\"showLoadingWalletSpinner\" class=\"white-nano-spinner\"></div>\n                    <span>Proceed</span>\n                </button>\n            </div>\n            <div id=\"loaded-wallet\">\n                <div style=\"gap: 20px;font-size: 20px;\" class=\"flex-row-center\">\n                  <img src=\"" + ((_c = this.config) === null || _c === void 0 ? void 0 : _c.logo) + "\" alt=\"\" style=\"width: 40px; border-radius: 50%;\">\n                  <div class=\"business-name\">" + ((_d = this.config) === null || _d === void 0 ? void 0 : _d.businessName) + "</div>\n                </div>\n                <div style=\"margin-bottom:10px; text-align:center\">Securely Pay With Crygoca Wallet \uD83D\uDE80</div>\n                  <p>Your Wallet Balance is</p>\n                  <h3 id=\"walletBalance\" style=\"color:black!important\">$187.30</h3>\n\n                  <div class=\"debit-message\">\n                      You will be debited <span id=\"amountToPay\">$0.00</span>\n                  </div>\n\n                  <div class=\"see-more-cont\">\n                      <a id=\"see-more\" href=\"javascript:void(0)\">See More Details</a>\n                  </div>\n                  <div class=\"more-details\">\n                       <div id=\"details-content\"></div>\n                  </div>\n\n                  <input id=\"authPin\" placeholder=\"Enter your authorization pin...\" type=\"number\" class=\"authorization-pin\"/>\n\n                  <button id=\"sendAuthPinBtn\" class=\"pay-btn flex-row-center\">\n                    <div id=\"showSendingAuthorizationSpinner\" class=\"white-nano-spinner\"></div>\n                    <span>Proceed</span>\n                  </button>\n\n                  <button id=\"payNowBtn\" class=\"pay-btn flex-row-center\" style=\"display: none;\">\n                      <div id=\"showPayNowSpinner\" class=\"white-nano-spinner\"></div>\n                      <span>Pay Now</span>\n                  </button>\n\n                  <div class=\"otp-link-text\">\n                      <a href=\"javascript:void(0)\" id=\"resendOtp\">Resend Authorization Pin</a>\n                  </div>\n            </div>\n        </div>\n    </div>";
            document.body.appendChild(this.modal);
            // Set wallet balance and amount
            document.getElementById("walletBalance").innerText = "".concat(((_e = this.wallet) === null || _e === void 0 ? void 0 : _e.currencySymbol) || "$").concat(((_g = (_f = this.wallet) === null || _f === void 0 ? void 0 : _f.balance) !== null && _g !== void 0 ? _g : 0).toFixed(2));
            document.getElementById("amountToPay").innerText = "".concat(((_h = this.wallet) === null || _h === void 0 ? void 0 : _h.currencySymbol) || "$").concat(((_j = this.config.amount) !== null && _j !== void 0 ? _j : 0).toFixed(2));
            // Handle close button
            document
                .getElementById("closeModalBtn")
                .addEventListener("click", function () { return _this.closeModal(); });
            document.getElementById("see-more").addEventListener("click", function (event) {
                var detailsDiv = document.querySelector(".more-details");
                var detailsContent = document.getElementById("details-content");
                var seeMoreBtn = event.target; // Reference the button
                // Sample data (replace with dynamic data as needed)
                var details = {
                    name: "".concat(_this.wallet.user.firstname, " ").concat(_this.wallet.user.lastname),
                    orderId: _this.config.checkOutId,
                    walletId: _this.wallet.walletAccountNo
                };
                // Populate the details content
                if (detailsContent) {
                    detailsContent.innerHTML = "\n                <p><strong>Name:</strong> ".concat(details.name, "</p>\n                <p><strong>Order ID:</strong> ").concat(details.orderId, "</p>\n                <p><strong>Wallet ID:</strong> ").concat(details.walletId, "</p>\n            ");
                }
                // Toggle visibility
                if (detailsDiv) {
                    var isHidden = detailsDiv.style.display === "none" || !detailsDiv.style.display;
                    detailsDiv.style.display = isHidden ? "block" : "none";
                    seeMoreBtn.textContent = isHidden ? "Show Less" : "See More Details";
                }
            });
            //Get wallet details...
            document
                .getElementById("getWalletInfoBtn")
                .addEventListener("click", function () { return __awaiter(_this, void 0, void 0, function () {
                var showLoadingWalletSpinner, loadWallet, loadedWallet, walletIdEl, walletId, response, otpResendLink;
                var _a, _b, _c, _d, _e;
                return __generator(this, function (_f) {
                    switch (_f.label) {
                        case 0:
                            showLoadingWalletSpinner = document.getElementById("showLoadingWalletSpinner");
                            loadWallet = document.getElementById("load-wallet");
                            loadedWallet = document.getElementById("loaded-wallet");
                            walletIdEl = document.getElementById("walletId");
                            showLoadingWalletSpinner.style.display = "block";
                            walletId = walletIdEl.value;
                            return [4 /*yield*/, this.getWallet(walletId)];
                        case 1:
                            response = _f.sent();
                            console.log(response);
                            if (response.status) {
                                loadWallet.style.display = "none";
                                loadedWallet.style.display = "block"; // Show the Pay Now button
                                showLoadingWalletSpinner.style.display = "none";
                                // if(this.wallet?.currencySymbol !== this.config.currency){
                                //   return alert(`This ${this.wallet?.currency} cannot be used to settle this order in ${this.config.currency}`  )
                                // }
                                if (response === null || response === void 0 ? void 0 : response.wallet) {
                                    this.wallet = response.wallet;
                                    this.user = response.wallet.user;
                                    document.getElementById("walletBalance").innerText = "".concat(((_a = this.wallet) === null || _a === void 0 ? void 0 : _a.currencySymbol) || "$").concat(((_c = (_b = this.wallet) === null || _b === void 0 ? void 0 : _b.balance) !== null && _c !== void 0 ? _c : 0)
                                        .toFixed(2)
                                        .replace(/\B(?=(\d{3})+(?!\d))/g, ","));
                                    document.getElementById("amountToPay").innerText = "".concat(((_d = this.wallet) === null || _d === void 0 ? void 0 : _d.currencySymbol) || "$").concat(((_e = this.config.amount) !== null && _e !== void 0 ? _e : 0)
                                        .toFixed(2)
                                        .replace(/\B(?=(\d{3})+(?!\d))/g, ","));
                                    if (this.config.amount > this.wallet.balance) {
                                        this.setInsufficientFundsbtn();
                                    }
                                    else {
                                        otpResendLink = document.querySelector("otp-link-text");
                                        otpResendLink.style.display = "block";
                                    }
                                }
                            }
                            else {
                                showLoadingWalletSpinner.style.display = "none";
                                alert((response === null || response === void 0 ? void 0 : response.message) || "Failed to fetch wallet details.");
                            }
                            return [2 /*return*/];
                    }
                });
            }); });
            // Handle sending authorization PIN
            document
                .getElementById("sendAuthPinBtn")
                .addEventListener("click", function () { return __awaiter(_this, void 0, void 0, function () {
                var showSendingAuthorizationSpinner, sendAuthPinBtn, pinInput, payNowBtn, otpText, response;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            showSendingAuthorizationSpinner = document.getElementById("showSendingAuthorizationSpinner");
                            sendAuthPinBtn = document.getElementById("sendAuthPinBtn");
                            pinInput = document.getElementById("authPin");
                            payNowBtn = document.getElementById("payNowBtn");
                            otpText = document.querySelector(".otp-link-text");
                            showSendingAuthorizationSpinner.style.display = "block";
                            return [4 /*yield*/, this.sendPaymentAuthorizationCode(this.config.payloadHash, this.config.checkOutId)];
                        case 1:
                            response = _a.sent();
                            console.log("Authorization Code Response ==> ", response);
                            if (response.status) {
                                this.payment.orderId = this.config.checkOutId;
                                this.payment.paymentHash = this.config.payloadHash;
                                this.payment.accountId = this.wallet.user;
                                pinInput.style.display = "block";
                                payNowBtn.style.display = "flex"; // Show the Pay Now button
                                sendAuthPinBtn.style.display = "none"; // hide send otp button
                                showSendingAuthorizationSpinner.style.display = "none";
                                otpText.style.display = "block"; // Show the Resend OTP
                            }
                            return [2 /*return*/];
                    }
                });
            }); });
            // Handle Pay Now button click
            document
                .getElementById("payNowBtn")
                .addEventListener("click", function () { return __awaiter(_this, void 0, void 0, function () {
                var showPayNowSpinner, authPin, payload, response;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            showPayNowSpinner = document.getElementById("showPayNowSpinner");
                            authPin = document.getElementById("authPin")
                                .value;
                            if (!authPin) return [3 /*break*/, 2];
                            showPayNowSpinner.style.display = "block";
                            this.payment.authorizationPin = authPin;
                            payload = this.buildPayload();
                            console.log(payload);
                            return [4 /*yield*/, this.config.callback(payload)];
                        case 1:
                            response = _a.sent();
                            showPayNowSpinner.style.display = "none";
                            alert(response.message);
                            if (response.status) ;
                            _a.label = 2;
                        case 2: return [2 /*return*/];
                    }
                });
            }); });
            // Handle Resend OTP link
            document.getElementById("resendOtp").addEventListener("click", function () { });
        };
        CrygocaPayModal.prototype.destroyModal = function () {
            if (this.modal) {
                this.modal.remove(); // Remove from DOM
                this.modal = null; // Clear reference
            }
        };
        CrygocaPayModal.prototype.setInsufficientFundsbtn = function () {
            var sendAuthPinBtn = document.getElementById("sendAuthPinBtn");
            if (sendAuthPinBtn) {
                sendAuthPinBtn.textContent = "Insufficient Funds";
                sendAuthPinBtn.style.opacity = "0.4";
                sendAuthPinBtn.style.pointerEvents = "none";
            }
        };
        CrygocaPayModal.prototype.getWallet = function (walletId) {
            return __awaiter(this, void 0, void 0, function () {
                var url, response, error_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            this.retrieveToken(this.tokenKey);
                            url = "".concat(this.serverUrl, "/api/v1/wallet/get-receipient-wallet-details?walletId=").concat(walletId, "&isTransfer=0");
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 4, , 5]);
                            return [4 /*yield*/, fetch(url, {
                                    method: "GET",
                                    headers: {
                                        "Content-Type": "application/json",
                                        Authorization: "Bearer ".concat(this.config.publicKey), // Add token if available
                                    },
                                })];
                        case 2:
                            response = _a.sent();
                            if (!response.ok) {
                                throw new Error("HTTP error! Status: ".concat(response.status));
                            }
                            return [4 /*yield*/, response.json()];
                        case 3: return [2 /*return*/, _a.sent()];
                        case 4:
                            error_1 = _a.sent();
                            console.error("Error fetching wallet details:", error_1);
                            return [3 /*break*/, 5];
                        case 5: return [2 /*return*/];
                    }
                });
            });
        };
        CrygocaPayModal.prototype.sendPaymentAuthorizationCode = function (payloadHash, checkOutId) {
            return __awaiter(this, void 0, void 0, function () {
                var url, response, error_2;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            url = "".concat(this.serverUrl, "/api/v1/wallet/send-wallet-pay-authorization-pin");
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 4, , 5]);
                            return [4 /*yield*/, fetch(url, {
                                    method: "POST",
                                    headers: {
                                        "Content-Type": "application/json",
                                        Authorization: "Bearer ".concat(this.config.publicKey), // Add token if available
                                    },
                                    body: JSON.stringify({
                                        payloadHash: payloadHash,
                                        checkOutId: checkOutId,
                                        accountId: this.wallet.user,
                                    }),
                                })];
                        case 2:
                            response = _a.sent();
                            if (!response.ok) {
                                throw new Error("HTTP error! Status: ".concat(response.status));
                            }
                            return [4 /*yield*/, response.json()];
                        case 3: return [2 /*return*/, _a.sent()];
                        case 4:
                            error_2 = _a.sent();
                            console.error("Error fetching wallet details:", error_2);
                            return [3 /*break*/, 5];
                        case 5: return [2 /*return*/];
                    }
                });
            });
        };
        CrygocaPayModal.prototype.buildPayload = function () {
            var _a, _b, _c, _d;
            return __assign({ debitDetails: {
                    walletAccountNo: this.wallet.walletAccountNo,
                }, sourceAmount: this.payment.amount, sourceCurrency: (_d = (_c = (_b = (_a = this.user) === null || _a === void 0 ? void 0 : _a.geoData) === null || _b === void 0 ? void 0 : _b.currency) === null || _c === void 0 ? void 0 : _c.code) === null || _d === void 0 ? void 0 : _d.toUpperCase(), targetCurrency: "USD", saveBeneficiary: false }, this.payment);
        };
        CrygocaPayModal.prototype.retrieveToken = function (tokenKey) {
            var cookies = document.cookie.split("; ");
            var tokenCookie = cookies.find(function (row) { return row.startsWith("".concat(tokenKey, "=")); });
            if (tokenCookie) {
                return tokenCookie.split("=")[1];
            }
            else {
                return null;
            }
        };
        return CrygocaPayModal;
    }());
    // **Usage**
    _window.CrygocaPay = CrygocaPayModal;
  
  }));
  