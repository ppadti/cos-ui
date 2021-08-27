import React, { FunctionComponent, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Card, Flex, FlexItem } from '@patternfly/react-core';
import { css } from '@patternfly/react-styles';
import {
  IActions,
  TableComposable,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@patternfly/react-table';

import { ConnectorMachineActorRef, useConnector } from './Connector.machine';
import { ConnectorStatusIcon } from './ConnectorStatusIcon';
import { useConnectorsMachine } from './ConnectorsPage.machine';
import { useConnectorsPageMachineService } from './ConnectorsPageContext';
import { ConnectorsPagination } from './ConnectorsPagination';
import './ConnectorsTable.css';
import { ConnectorsToolbar } from './ConnectorsToolbar';
import { DeleteDialog } from './DeleteDialog';
import { useConnectorStatusLabel } from './useConnectorStatusLabel';

export const ConnectorsTable: FunctionComponent = () => {
  const { t } = useTranslation();
  const service = useConnectorsPageMachineService();
  const { response } = useConnectorsMachine(service);

  return (
    <Card className={'pf-u-pb-xl'}>
      <ConnectorsToolbar />
      <div className={'pf-u-p-md'}>
        <TableComposable
          aria-label="Sortable Table"
          className={css('connectors-table-view__table')}
        >
          <Thead>
            <Tr>
              <Th>{t('name')}</Th>
              <Th>{t('type')}</Th>
              <Th>{t('category')}</Th>
              <Th>{t('status')}</Th>
            </Tr>
          </Thead>
          <Tbody>
            {response?.items?.map((ref) => (
              <ConnectorRow connectorRef={ref} key={ref.id} />
            ))}
          </Tbody>
        </TableComposable>
      </div>
      <ConnectorsPagination isCompact={false} />
    </Card>
  );
};

type ConnectorRowProps = {
  connectorRef: ConnectorMachineActorRef;
};
export const ConnectorRow: FunctionComponent<ConnectorRowProps> = ({
  connectorRef,
}) => {
  const { t } = useTranslation();
  const service = useConnectorsPageMachineService();
  const { selectedConnector } = useConnectorsMachine(service);

  const {
    connector,
    canStart,
    canStop,
    canDelete,
    onStart,
    onStop,
    onDelete,
    onSelect,
  } = useConnector(connectorRef);

  const statusLabel = useConnectorStatusLabel(connector.status!);

  const [showDeleteConnectorConfirm, setShowDeleteConnectorConfirm] =
    useState(false);

  const doCancelDeleteConnector = () => {
    setShowDeleteConnectorConfirm(false);
  };

  const doDeleteConnector = () => {
    setShowDeleteConnectorConfirm(false);
    onDelete();
  };

  const actions: IActions = [
    {
      title: 'Start',
      onClick: onStart,
      isDisabled: !canStart,
    },
    {
      title: 'Stop',
      onClick: onStop,
      isDisabled: !canStop,
    },
    {
      title: 'Delete',
      onClick: () => setShowDeleteConnectorConfirm(true),
      isDisabled: !canDelete,
    },
    {
      isSeparator: true,
    },
    {
      title: 'Details',
      onClick: onSelect,
    },
  ];

  return (
    <>
      <DeleteDialog
        connectorName={connector.metadata?.name}
        i18nCancel={t('cancel')}
        i18nDelete={t('delete')}
        i18nTitle={t('deleteConnector')}
        showDialog={showDeleteConnectorConfirm}
        onCancel={doCancelDeleteConnector}
        onConfirm={doDeleteConnector}
      />
      <Tr
        onClick={(event) => {
          // send the event only if the click didn't happen on the actions button
          if ((event.target as any | undefined)?.type !== 'button') {
            onSelect();
          }
        }}
        className={css(
          'pf-c-table-row__item',
          'pf-m-selectable',
          selectedConnector?.id === connector.id && 'pf-m-selected'
        )}
      >
        <Td dataLabel={t('name')}>{connector.metadata?.name}</Td>
        <Td dataLabel={t('type')}>{connector.connector_type_id}</Td>
        <Td dataLabel={t('category')}>TODO: MISSING</Td>
        <Td dataLabel={t('status')}>
          <Flex>
            <FlexItem spacer={{ default: 'spacerSm' }}>
              <ConnectorStatusIcon
                name={connector.metadata!.name!}
                status={connector.status!}
              />
            </FlexItem>
            <FlexItem>{statusLabel}</FlexItem>
          </Flex>
        </Td>
        <Td
          actions={{ items: actions }}
          data-testid={`actions-for-${connector.id}`}
        />
      </Tr>
    </>
  );
};
