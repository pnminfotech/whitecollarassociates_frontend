import React, { useEffect, useState } from 'react';
import axios from 'axios';

const TenantData = () => {
    const [tenantList, setTenantList] = useState([]);
    const [screenWidth, setScreenWidth] = useState(window.innerWidth);

    useEffect(() => {
        axios
            .get('https://api.sheetbest.com/sheets/256f7255-1d4c-49df-ad8f-66d470900d5e')
            .then((res) => setTenantList(res.data))
            .catch((err) => console.error('Error fetching tenant data:', err));

        const handleResize = () => setScreenWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const TABLET_BREAKPOINT = 768;
    const MOBILE_BREAKPOINT = 576;

    const baseFontFamily = '"Poppins", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif';

    const getContainerStyle = () => ({
        fontFamily: baseFontFamily,
        backgroundColor: '#ffffff',
        borderRadius: '0.75rem',
        boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
        maxWidth: '1200px',
        width: '95%',
        overflow: 'hidden',
        margin: screenWidth <= MOBILE_BREAKPOINT ? '1rem auto' : '2rem auto',
        padding: screenWidth <= MOBILE_BREAKPOINT ? '1rem' : '1.5rem',
    });

    const getTitleStyle = () => ({
        fontSize: screenWidth <= MOBILE_BREAKPOINT ? '1.7rem' : '2rem',
        fontWeight: '700',
        color: '#0d6efd',
        marginBottom: '1.5rem',
        textAlign: 'left',
        paddingLeft: '0.5rem',
        cursor: 'default',
        fontFamily: baseFontFamily,
    });

    const getTableWrapperStyle = () => ({
        overflowX: screenWidth <= TABLET_BREAKPOINT ? 'auto' : 'visible',
        WebkitOverflowScrolling: 'touch',
        border: '1px solid #dee2e6',
        borderRadius: '0.5rem',
        marginTop: '1.5rem',
    });

    const getTableStyle = () => ({
        width: screenWidth <= TABLET_BREAKPOINT ? 'auto' : '100%',
        minWidth: screenWidth <= TABLET_BREAKPOINT ? '800px' : 'auto',
        fontSize: screenWidth <= MOBILE_BREAKPOINT ? '0.9rem' : '1rem',
        borderCollapse: 'separate',
        borderSpacing: '0',
        fontWeight: '500',
        fontFamily: baseFontFamily,
    });

    const getSharedCellBorderStyle = () => ({
        borderBottom: '1px solid #dee2e6',
        borderRight: '1px solid #dee2e6',
    });

    const getTableCellStyle = (isLastColumn = false, isLastRow = false) => ({
        padding: screenWidth <= MOBILE_BREAKPOINT ? '0.6rem 0.8rem' : '0.75rem 1rem',
        textAlign: 'left',
        verticalAlign: 'middle',
        color: '#212529',
        whiteSpace: screenWidth <= TABLET_BREAKPOINT ? 'nowrap' : 'normal',
        fontWeight: '500',
        fontFamily: baseFontFamily,
        ...(isLastColumn ? { borderRight: 'none' } : getSharedCellBorderStyle()),
        ...(isLastRow ? { borderBottom: 'none' } : {}),
    });

    const getTableHeaderStyle = (isLastColumn = false) => ({
        ...getTableCellStyle(isLastColumn),
        backgroundColor: '#f8f9fa',
        fontWeight: '700',
        color: '#1a1a1a',
        borderBottom: '2px solid #dee2e6',
    });

    const getLinkStyle = () => ({
        color: '#0d6efd',
        textDecoration: 'none',
        fontWeight: '600',
    });

    const getNoDataMessageStyle = () => ({
        padding: '1rem',
        backgroundColor: '#f1f3f5',
        border: '1px solid #ccc',
        borderRadius: '0.25rem',
        color: '#6c757d',
        textAlign: 'center',
        marginTop: '1rem',
        fontWeight: '600',
        fontFamily: baseFontFamily,
    });

    const getBackButtonStyle = () => ({
        marginTop: '1.5rem',
        display: 'flex',
        justifyContent: 'flex-end',
    });

    const getButtonStyle = () => ({
        backgroundColor: '#0d6efd',
        color: 'white',
        padding: '0.5rem 1.2rem',
        fontSize: '1rem',
        fontWeight: '600',
        border: 'none',
        borderRadius: '0.4rem',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        fontFamily: baseFontFamily,
    });

    const handleBack = () => {
        window.history.back();
    };

    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-start',
                minHeight: '100vh',
                backgroundColor: '#f8f9fa',
                padding: '2rem 1rem',
                boxSizing: 'border-box',
                fontFamily: baseFontFamily,
            }}
        >
            <div style={getContainerStyle()}>
                <h3 style={getTitleStyle()}>Tenant Data</h3>

                {tenantList.length === 0 ? (
                    <p style={getNoDataMessageStyle()}>No tenant data available.</p>
                ) : (
                    <>
                        <div style={getTableWrapperStyle()}>
                            <table style={getTableStyle()}>
                                <thead>
                                    <tr>
                                        <th style={getTableHeaderStyle()}>Name</th>
                                        <th style={getTableHeaderStyle()}>Room No</th>
                                        <th style={getTableHeaderStyle()}>Wing</th>
                                        <th style={getTableHeaderStyle()}>Address Proof</th>
                                        <th style={getTableHeaderStyle()}>No. of Family Members</th>
                                        <th style={getTableHeaderStyle()}>Permanent Address</th>
                                        <th style={getTableHeaderStyle(true)}>Mobile No</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tenantList.map((tenant, index) => {
                                        const isLastRow = index === tenantList.length - 1;
                                        return (
                                            <tr
                                                key={index}
                                                style={{
                                                    backgroundColor:
                                                        index % 2 === 0 ? '#ffffff' : '#f2f2f2',
                                                    transition: 'background-color 0.2s ease',
                                                    cursor: 'pointer',
                                                }}
                                                onMouseOver={(e) =>
                                                    (e.currentTarget.style.backgroundColor = '#e6f7ff')
                                                }
                                                onMouseOut={(e) =>
                                                (e.currentTarget.style.backgroundColor =
                                                    index % 2 === 0 ? '#ffffff' : '#f2f2f2')
                                                }
                                            >
                                                <td style={getTableCellStyle(false, isLastRow)}>{tenant['Name']}</td>
                                                <td style={getTableCellStyle(false, isLastRow)}>{tenant['Room No']}</td>
                                                <td style={getTableCellStyle(false, isLastRow)}>{tenant['Wing']}</td>
                                                <td style={getTableCellStyle(false, isLastRow)}>
                                                    {tenant['Address Proof : AadharCard/Pancard'] ? (
                                                        <a
                                                            href={tenant['Address Proof : AadharCard/Pancard']}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            style={getLinkStyle()}
                                                            onMouseOver={(e) =>
                                                                (e.currentTarget.style.textDecoration = 'underline')
                                                            }
                                                            onMouseOut={(e) =>
                                                                (e.currentTarget.style.textDecoration = 'none')
                                                            }
                                                        >
                                                            View
                                                        </a>
                                                    ) : (
                                                        'Not uploaded'
                                                    )}
                                                </td>
                                                <td style={getTableCellStyle(false, isLastRow)}>{tenant['Number of Members in Family']}</td>
                                                <td style={getTableCellStyle(false, isLastRow)}>{tenant['Permanant Address']}</td>
                                                <td style={getTableCellStyle(true, isLastRow)}>{tenant['MobileNo']}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Back Button */}
                        <div style={getBackButtonStyle()}>
                            <button onClick={handleBack} style={getButtonStyle()}>
                                ← Back
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default TenantData;
