
import './movable-node.scss'
import NodeView from 'views/node/node'
import useAppDispatch from 'hooks/useAppDispatch'
import useBlueprintSelector from 'hooks/useBlueprintSelector'
import useClassName from 'hooks/useClassName'
import useDragMove from 'hooks/useDragMove'
import { BlueprintNodeId } from 'slices/blueprint/types/blueprint'
import { getNodePosition, isSelectedNode } from 'slices/blueprint/selectors/blueprint'
import { moveNodeAction, selectNodeAction } from 'slices/blueprint'
import { PointerEvent, useCallback, useRef } from 'react'

export default function MovableNodeView (props: {
  nodeId: BlueprintNodeId
  contextProgramId: BlueprintNodeId
}): JSX.Element {
  const { nodeId, contextProgramId } = props
  const { x, y } = useBlueprintSelector(state => getNodePosition(state, nodeId))
  const isSelected = useBlueprintSelector(state => isSelectedNode(state, nodeId))

  const dispatch = useAppDispatch()

  const onDragMove = (newX: number, newY: number): void => {
    dispatch(moveNodeAction({ nodeId, x: newX, y: newY }))
  }

  const { onPointerDown: onDragStart } = useDragMove(x, y, onDragMove)

  const onPointerDown = useCallback((event: PointerEvent<HTMLDivElement>) => {
    if (!isSelected) {
      dispatch(selectNodeAction({ nodeId }))
    }
    onDragStart(event)
  }, [isSelected, dispatch, onDragStart])

  return (
    <div
      className={useClassName('movable-node', isSelected ? ['selected'] : [])}
      onPointerDown={onPointerDown}
      style={{ transform: `translate(${x}px, ${y}px)` }}
    >
      <NodeView nodeId={nodeId} contextProgramId={contextProgramId} />
    </div>
  )
}
