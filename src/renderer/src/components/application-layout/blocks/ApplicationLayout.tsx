import clsx from 'clsx'
import { FC, PropsWithChildren } from 'react'

export interface ApplicationLayoutProps extends PropsWithChildren {}
export const ApplicationLayout: FC<ApplicationLayoutProps> = ({ children }) => {
  return <div className={clsx(['pf-app'])}>{children}</div>
}
