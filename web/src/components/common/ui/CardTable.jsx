/*
Copyright (C) 2025 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/

import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Table,
  Card,
  Skeleton,
  Pagination,
  Empty,
  Button,
  Collapsible,
} from '@douyinfe/semi-ui';
import { IconChevronDown, IconChevronUp } from '@douyinfe/semi-icons';
import PropTypes from 'prop-types';
import { useIsMobile } from '../../../hooks/common/useIsMobile';
import { useMinimumLoadingTime } from '../../../hooks/common/useMinimumLoadingTime';

/**
 * CardTable 响应式表格组件
 *
 * 在桌面端渲染 Semi-UI 的 Table 组件，在移动端则将每一行数据渲染成 Card 形式。
 * 该组件与 Table 组件的大部分 API 保持一致，只需将原 Table 换成 CardTable 即可。
 */
const CardTable = ({
  columns = [],
  dataSource = [],
  loading = false,
  rowKey = 'key',
  hidePagination = false,
  ...tableProps
}) => {
  const isMobile = useIsMobile();
  const { t } = useTranslation();

  const showSkeleton = useMinimumLoadingTime(loading);

  const getRowKey = (record, index) => {
    if (typeof rowKey === 'function') return rowKey(record);
    return record[rowKey] !== undefined ? record[rowKey] : index;
  };

  if (!isMobile) {
    const finalTableProps = hidePagination
      ? { ...tableProps, pagination: false }
      : tableProps;

    return (
      <div className='card-table-desktop-wrapper'>
        <Table
          columns={columns}
          dataSource={dataSource}
          loading={loading}
          rowKey={rowKey}
          {...finalTableProps}
        />
      </div>
    );
  }

  if (showSkeleton) {
    const visibleCols = columns.filter((col) => {
      if (tableProps?.visibleColumns && col.key) {
        return tableProps.visibleColumns[col.key];
      }
      return true;
    });

    const renderSkeletonCard = (key) => {
      const placeholder = (
        <div className='p-4'>
          {visibleCols.map((col, idx) => {
            if (!col.title) {
              return (
                <div key={idx} className='mt-3 flex justify-end'>
                  <Skeleton.Title active style={{ width: 100, height: 24 }} />
                </div>
              );
            }

            return (
              <div
                key={idx}
                className='flex justify-between items-center py-2.5 border-b last:border-b-0'
                style={{
                  borderColor: 'var(--semi-color-border)',
                  borderStyle: 'solid',
                  borderWidth: '0 0 1px 0',
                  opacity: idx === visibleCols.length - 1 ? 0 : 0.3,
                }}
              >
                <Skeleton.Title active style={{ width: 80, height: 16 }} />
                <Skeleton.Title
                  active
                  style={{
                    width: `${50 + (idx % 3) * 10}%`,
                    maxWidth: 180,
                    height: 16,
                  }}
                />
              </div>
            );
          })}
        </div>
      );

      return (
        <Card
          key={key}
          className='card-table-mobile-card !rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800'
          style={{
            transition: 'all 0.2s ease-in-out',
          }}
        >
          <Skeleton loading={true} active placeholder={placeholder}></Skeleton>
        </Card>
      );
    };

    return (
      <div className='flex flex-col gap-3'>
        {[1, 2, 3].map((i) => renderSkeletonCard(i))}
      </div>
    );
  }

  const isEmpty = !showSkeleton && (!dataSource || dataSource.length === 0);

  const MobileRowCard = ({ record, index }) => {
    const [showDetails, setShowDetails] = useState(false);
    const rowKeyVal = getRowKey(record, index);

    const hasDetails =
      tableProps.expandedRowRender &&
      (!tableProps.rowExpandable || tableProps.rowExpandable(record));

    return (
      <Card
        key={rowKeyVal}
        className='card-table-mobile-card !rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md hover:border-gray-200 dark:hover:border-gray-700 transition-all duration-200'
        style={{
          backgroundColor: 'var(--semi-color-bg-0)',
        }}
      >
        <div className='p-4'>
          {(() => {
            const visibleCols = columns.filter((col) => {
              if (
                tableProps?.visibleColumns &&
                col.key &&
                !tableProps.visibleColumns[col.key]
              ) {
                return false;
              }
              return true;
            });

            // 分离有标题和无标题的列
            const colsWithTitle = visibleCols.filter((col) => col.title);
            const colsWithoutTitle = visibleCols.filter((col) => !col.title);

            return (
              <>
                {colsWithTitle.map((col, colIdx) => {
                  const title = col.title;
                  const cellContent = col.render
                    ? col.render(record[col.dataIndex], record, index)
                    : record[col.dataIndex];

                  const isLast = colIdx === colsWithTitle.length - 1;

                  return (
                    <div
                      key={col.key || colIdx}
                      className='flex justify-between items-start py-2.5'
                      style={{
                        borderBottom:
                          !isLast
                            ? '1px solid var(--semi-color-border)'
                            : 'none',
                        opacity: isLast ? 1 : 0.3,
                      }}
                    >
                      <span className='font-medium text-gray-600 dark:text-gray-400 mr-3 whitespace-nowrap select-none text-sm flex-shrink-0'>
                        {title}
                      </span>
                      <div className='flex-1 break-words flex justify-end items-center gap-1 text-right min-w-0'>
                        {cellContent !== undefined && cellContent !== null
                          ? cellContent
                          : <span className='text-gray-400 dark:text-gray-500'>-</span>}
                      </div>
                    </div>
                  );
                })}
                {colsWithoutTitle.map((col, colIdx) => {
                  const cellContent = col.render
                    ? col.render(record[col.dataIndex], record, index)
                    : record[col.dataIndex];

                  return (
                    <div key={col.key || `no-title-${colIdx}`} className='mt-3 flex justify-end'>
                      {cellContent}
                    </div>
                  );
                })}
              </>
            );
          })()}
        </div>

        {hasDetails && (
          <>
            <div className='px-4 pb-2'>
              <Button
                theme='borderless'
                size='small'
                className='w-full flex justify-center items-center gap-2 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors'
                icon={showDetails ? <IconChevronUp /> : <IconChevronDown />}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDetails(!showDetails);
                }}
              >
                {showDetails ? t('收起') : t('详情')}
              </Button>
            </div>
            <Collapsible isOpen={showDetails} keepDOM>
              <div className='px-4 pb-4 pt-2 border-t border-gray-100 dark:border-gray-800'>
                {tableProps.expandedRowRender(record, index)}
              </div>
            </Collapsible>
          </>
        )}
      </Card>
    );
  };

  if (isEmpty) {
    if (tableProps.empty) return tableProps.empty;
    return (
      <div className='flex justify-center p-4'>
        <Empty description='No Data' />
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-3'>
      {dataSource.map((record, index) => (
        <MobileRowCard
          key={getRowKey(record, index)}
          record={record}
          index={index}
        />
      ))}
      {!hidePagination && tableProps.pagination && dataSource.length > 0 && (
        <div className='mt-4 flex justify-center'>
          <Pagination {...tableProps.pagination} />
        </div>
      )}
    </div>
  );
};

CardTable.propTypes = {
  columns: PropTypes.array.isRequired,
  dataSource: PropTypes.array,
  loading: PropTypes.bool,
  rowKey: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  hidePagination: PropTypes.bool,
};

export default CardTable;
