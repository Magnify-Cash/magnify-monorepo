import React, { useState } from 'react'; // Import useState if not already imported
import { formatAddress } from "@/helpers/formatAddress";
import { fromWei } from "@/helpers/utils";

const QuickLoanListRow = ({ index, style, items, nft, token, setSelectedLendingDesk }) => {


    return (
        <div style={style}>
            <div className="magnify-check" key={items[index]?.lendingDesk.id}>
                <input
                    type="radio"
                    className="btn-check"
                    autoComplete="off"
                    name="desks"
                    id={items[index]?.lendingDesk.id}
                    onClick={(e) => {
                        setSelectedLendingDesk((e.target as HTMLInputElement).value);
                    }}
                    value={JSON.stringify(items[index])}
                />
                <label
                    className="btn py-2 d-block w-100 border border-secondary border-opacity-25"
                    htmlFor={items[index]?.lendingDesk.id}
                >
                    <div className="d-flex align-items-center justify-content-center mx-auto">
                        <img
                            src={nft?.logoURI}
                            width="30"
                            alt={nft?.address}
                            className="flex-shrink-0"
                        />
                        <span className="ms-3">
                            {formatAddress(items[index]?.loanConfig?.nftCollection?.id)}
                        </span>
                    </div>
                    <div className="container-fluid g-0">
                        <div className="row g-2 mt-2">
                            <div className="col">
                                <div className="p-2 rounded-3 bg-success-subtle text-center">
                                    <div className="text-success-emphasis h3 mb-3">
                                        <i className="fa-light fa-hand-holding-dollar" />
                                    </div>
                                    <div className="fw-bold">
                                        {fromWei(
                                            items[index]?.loanConfig.maxAmount,
                                            token?.token.decimals,
                                        )}
                                    </div>
                                    <small className="fw-normal">max offer</small>
                                </div>
                            </div>
                            <div className="col">
                                <div className="p-2 rounded-3 bg-info-subtle text-center">
                                    <div className="text-info-emphasis h3 mb-3">
                                        <i className="fa-light fa-calendar-clock" />
                                    </div>
                                    <div className="fw-bold">
                                        {items[index]?.loanConfig.maxDuration / 24} days
                                    </div>
                                    <small className="fw-normal">duration</small>
                                </div>
                            </div>
                            <div className="col">
                                <div className="p-2 rounded-3 bg-primary bg-opacity-10 text-center">
                                    <div className="text-primary-emphasis h3 mb-3">
                                        <i className="fa-light fa-badge-percent" />
                                    </div>
                                    <div className="fw-bold">
                                        {items[index]?.loanConfig.maxInterest / 100} %
                                    </div>
                                    <small className="fw-normal">interest</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </label>
            </div>
        </div>
    );
};

export { QuickLoanListRow };